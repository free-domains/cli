const Conf = require("conf");
const fetch = require("node-fetch");
const prompts = require("prompts");

const account = new Conf();
const questions = require("../util/questions").check;

module.exports = async function check() {
    const username = account.get("username");

    const response = await prompts(questions);

    const domain = response.domain;
    const subdomain = response.subdomain.toLowerCase();

    fetch(
        `https://api.github.com/repos/free-domains/register/contents/domains/${subdomain}.${domain}.json`,
        {
            method: "GET",
            headers: {
                "User-Agent": username
            }
        }
    ).then(async (res) => {
        if(res.status && res.status == 404) {
            console.log("\nCongratulations, that subdomain is available!");
            console.log("To register, run the command: `domains register`");
        } else console.log("\nSorry, that subdomain is taken!");
    })
}
