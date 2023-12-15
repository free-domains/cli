const axios = require("axios");
const prompts = require("prompts");

const questions = require("../util/questions").check;

module.exports = async function check() {
    const response = await prompts(questions);

    const domain = response.domain;
    const subdomain = response.subdomain.toLowerCase();

    let res;

    try {
        const request = await axios.get(`https://free-domains-api.wdh.gg/check?domain=${subdomain}.${domain}`);

        res = request;
    } catch(err) {
        res = err.response;
    }

    if(res.status === 500) return console.log("An error occurred, please try again later.");

    const message = res.data.message;

    if(message === "DOMAIN_UNAVAILABLE") return console.log("\nSorry, that subdomain is taken!");

    if(message === "DOMAIN_AVAILABLE") {
        console.log("\nCongratulations, that subdomain is available!");
        console.log("To register, run the command: `domains register`");
    }
}
