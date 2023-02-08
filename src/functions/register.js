const { Base64 } = require("js-base64");
const Conf = require("conf");
const fetch = require("node-fetch");
const { Octokit } = require("@octokit/core");
const prompts = require("prompts");

const account = new Conf();
const questions = require("../util/questions").register;

function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = async function register() {
    if(!account.has("username")) {
        console.log("You are not logged in!");
        console.log("To log in, run the command: `domains login`");
        return;
    }

    console.log(`Username: ${account.get("username")}`);
    console.log(`Email: ${account.get("email")}\n`);

    const octokit = new Octokit({ auth: account.get("token") });

    await octokit.request("PUT /user/starred/{owner}/{repo}", {
        owner: "free-domains",
        repo: "register"
    })

    const response = await prompts(questions);

    let forkName;

    await octokit.request("POST /repos/{owner}/{repo}/forks", {
        owner: "free-domains",
        repo: "register",
        default_branch_only: true
    }).then(res => forkName = res.data.name)

    const username = account.get("username");
    const email = account.get("email");

    const domain = response.domain;
    const subdomain = response.subdomain.toLowerCase();
    const recordType = response.record;
    let recordValue = response.record_value.toLowerCase();
    const proxyStatus = response.proxy_state;

    if(recordType === "A" || recordType === "AAAA") {
        recordValue = JSON.stringify(recordValue.split(",").map((s) => s.trim()));
    } else {
        recordValue = `"${recordValue.trim()}"`;
    }

    let record = `"${recordType}": ${recordValue}`;

    if(recordType === "TXT") {
        recordValue = `"${response.record_value.toLowerCase()}"`;

record = `"${recordType}": [
            {
                "name": "@",
                "value": ${recordValue.trim()}
            }
        ]`
    }

let fullContent = `{
    "$schema": "../schemas/domain.json",

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

    const contentEncoded = Base64.encode(fullContent);

    fetch(
        `https://api.github.com/repos/free-domains/register/contents/domains/${subdomain}.${domain}.json`,
        {
            method: "GET",
            headers: {
                "User-Agent": username,
            },
        }
    ).then(async (res) => {
        if(res.status && res.status == 404) {
            octokit
                .request("PUT /repos/{owner}/{repo}/contents/{path}", {
                    owner: username,
                    repo: forkName,
                    path: "domains/" + subdomain + "." + domain + ".json",
                    message: `feat(domain): add \`${subdomain}.${domain}\``,
                    content: contentEncoded
                })
                .catch((err) => { throw new Error(err); });
        } else throw new Error("That subdomain is taken!");
    })

    await delay(2000);

    const pr = await octokit.request("POST /repos/{owner}/{repo}/pulls", {
        owner: "free-domains",
        repo: "register",
        title: `Register ${subdomain}.${domain}`,
        body:  `Added \`${subdomain}.${domain}\` using the [CLI](https://cli.freesubdomains.org).`,
        head: username + ":main",
        base: "main"
    })

    console.log(`\nYour pull request has been submitted.\nYou can check the status of your pull request here: ${pr.data.html_url}`);
}
