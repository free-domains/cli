const Conf = require("conf");
const fetch = require("node-fetch");
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

    console.log(`Username: ${account.get("username")}`);
    console.log(`Email: ${account.get("email")}\n`);

    const octokit = new Octokit({ auth: account.get("token") });

    const response = await prompts(questions);

    let forkName;

    await octokit.request("POST /repos/{owner}/{repo}/forks", {
        owner: "free-domains",
        repo: "register",
        default_branch_only: true
    }).then(res => forkName = res.data.name)

    const username = account.get("username");

    const domain = response.domain;
    const subdomain = response.subdomain.toLowerCase();
    const confirmation = response.confirmation;

    if(!confirmation) return;

    fetch(
        `https://api.github.com/repos/free-domains/register/contents/domains/${subdomain}.${domain}.json`,
        {
            method: "GET",
            headers: {
                "User-Agent": username,
            },
        }
    ).then(async (res) => {
        if(res.status && res.status == 200) {
            const file = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
                owner: "free-domains",
                repo: "register",
                path: "domains/" + subdomain + "." + domain + ".json"
            })

            octokit
                .request("DELETE /repos/{owner}/{repo}/contents/{path}", {
                    owner: username,
                    repo: forkName,
                    path: "domains/" + subdomain + "." + domain + ".json",
                    message: `chore(domain): remove \`${subdomain}.${domain}\``,
                    sha: file.data.sha
                })
                .catch((err) => { throw new Error(err); });
        } else throw new Error("That subdomain does not exist!");
    })

    await delay(2000);

    const res = await octokit.request("POST /repos/{owner}/{repo}/pulls", {
        owner: "free-domains",
        repo: "register",
        title: `Remove ${subdomain}.${domain}`,
        body:  `Removed \`${subdomain}.${domain}\` using the [CLI](https://cli.freesubdomains.org).`,
        head: username + ":main",
        base: "main"
    })

    console.log("\nYour pull request has been submitted.");
    console.log("You can check the status of your pull request here: " + res.data.html_url);
}