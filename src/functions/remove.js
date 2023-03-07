const axios = require("axios");
const Conf = require("conf");
const { Octokit } = require("@octokit/core");
const prompts = require("prompts");

const account = new Conf();
const questions = require("../util/questions").remove;

function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = async function remove() {
    if(!account.has("username")) {
        console.log("You are not logged in!");
        console.log("To log in, run the command: `domains login`");
        return;
    }

    const username = account.get("username");
    const email = account.get("email");

    console.log(`Username: ${username}`);
    console.log(`Email: ${email}\n`);

    const octokit = new Octokit({ auth: account.get("token") });

    const response = await prompts(questions);

    const domain = response.domain;
    const subdomain = response.subdomain.toLowerCase();
    const confirmation = response.confirmation;

    let checkRes;

    try {
        const result = await axios.get(`https://api.freesubdomains.org/check?domain=${subdomain}.${domain}`);

        checkRes = result.data;
    } catch(err) {
        checkRes = err.response;
    }

    if(checkRes.status === 500) return console.log("\nAn error occurred, please try again later.");
    if(checkRes.message === "DOMAIN_AVAILABLE") return console.log("\nThat subdomain does not exist!");

    let lookupRes;

    try {
        const result = await axios.get(`https://api.freesubdomains.org/lookup/domain?domain=${subdomain}.${domain}`);

        lookupRes = result.data;
    } catch(err) {
        lookupRes = err.response;
    }

    if(lookupRes.status === 500) return console.log("\nAn error occurred, please try again later.");
    if(lookupRes.owner.email.replace(" (at) ", "@") !== email) return console.log("\nYou do not own that domain!");

    let forkName;

    await octokit.request("POST /repos/{owner}/{repo}/forks", {
        owner: "free-domains",
        repo: "register",
        default_branch_only: true
    }).then(res => forkName = res.data.name)

    if(!confirmation) return;

    const file = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner: "free-domains",
        repo: "register",
        path: "domains/" + subdomain + "." + domain + ".json"
    })

    await octokit.request("DELETE /repos/{owner}/{repo}/contents/{path}", {
        owner: username,
        repo: forkName,
        path: "domains/" + subdomain + "." + domain + ".json",
        message: `chore(domain): remove \`${subdomain}.${domain}\``,
        sha: file.data.sha
    }).catch((err) => { throw new Error(err); })

    await delay(2000);

    const pr = await octokit.request("POST /repos/{owner}/{repo}/pulls", {
        owner: "free-domains",
        repo: "register",
        title: `Remove ${subdomain}.${domain}`,
        body:  `Removed \`${subdomain}.${domain}\` using the [CLI](https://cli.freesubdomains.org).`,
        head: username + ":main",
        base: "main"
    })

    console.log(`\nYour pull request has been submitted.\nYou can check the status of your pull request here: ${pr.data.html_url}`);
}