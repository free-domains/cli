const axios = require("axios");
const { Base64 } = require("js-base64");
const Conf = require("conf");
const { Octokit } = require("@octokit/core");
const prompts = require("prompts");

const account = new Conf();
const questions = require("../util/questions").update;

function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = async function update() {
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

    await octokit.request("PUT /user/starred/{owner}/{repo}", {
        owner: "free-domains",
        repo: "register"
    })

    const response = await prompts(questions);

    const domain = response.domain;
    const subdomain = response.subdomain.toLowerCase();
    const recordType = response.record;
    let recordValue = response.record_value.toLowerCase();
    const proxyStatus = response.proxy_state;

    let checkRes;

    try {
        const result = await axios.get(`https://free-domains-api.wdh.gg/check?domain=${subdomain}.${domain}`);

        checkRes = result.data;
    } catch(err) {
        checkRes = err.response;
    }

    if(checkRes.status === 500) return console.log("\nAn error occurred, please try again later.");
    if(checkRes.    message === "DOMAIN_AVAILABLE") return console.log("\nThat subdomain does not exist!");

    let lookupRes;

    try {
        const result = await axios.get(`https://free-domains-api.wdh.gg/lookup/domain?domain=${subdomain}.${domain}`);

        lookupRes = result.data;
    } catch(err) {
        lookupRes = err.response;
    }

    if(lookupRes.status === 500) return console.log("\nAn error occurred, please try again later.");
    if(lookupRes.owner.email.replace(" (at) ", "@") !== email) return console.log("\nYou do not own that domain!");

    const contentEncoded = Base64.encode(fullContent);

    let forkName;

    await octokit.request("POST /repos/{owner}/{repo}/forks", {
        owner: "free-domains",
        repo: "register",
        default_branch_only: true
    }).then(res => forkName = res.data.name)

    if(recordType === "A" || recordType === "AAAA") {
        recordValue = JSON.stringify(recordValue.split(",").map((s) => s.trim()));
    } else {
        recordValue = `"${recordValue.trim()}"`;
    }

    let record = `"${recordType}": ${recordValue}`;

const fullContent = `{
    "domain": "${domain}",
    "subdomain": "${subdomain}",

    "owner": {
        "email": "${email}"
    },

    "records": {
        ${record}
    },

    "proxied": ${proxyStatus}
}
`;

    const file = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
        owner: "free-domains",
        repo: "register",
        path: "domains/" + subdomain + "." + domain + ".json"
    })

    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
        owner: username,
        repo: forkName,
        path: "domains/" + subdomain + "." + domain + ".json",
        message: `feat(domain): update \`${subdomain}.${domain}\``,
        content: contentEncoded,
        sha: file.data.sha
    }).catch((err) => { throw new Error(err); })

    await delay(2000);

    const pr = await octokit.request("POST /repos/{owner}/{repo}/pulls", {
        owner: "free-domains",
        repo: "register",
        title: `Update ${subdomain}.${domain}`,
        body:  `Updated \`${subdomain}.${domain}\` using the [CLI](https://www.npmjs.com/package/@free-domains/cli).`,
        head: username + ":main",
        base: "main"
    })

    console.log(`\nYour pull request has been submitted.\nYou can check the status of your pull request here: ${pr.data.html_url}`);
}
