const axios = require("axios");
const Conf = require("conf");
const prompts = require("prompts");

const account = new Conf();
const questions = require("../util/questions").check;

module.exports = async function check() {
    const response = await prompts(questions);

    const domain = response.domain;
    const subdomain = response.subdomain.toLowerCase();

    const res = await axios.get(`https://api.freesubdomains.org/check?domain=${subdomain}.${domain}`);

    if(res.status === 500) return console.log("An error occurred, please try again later.");

    const message = res.data.message;

    if(message === "DOMAIN_UNAVAILABLE") return console.log("\nSorry, that subdomain is taken!");

    if(message === "DOMAIN_AVAILABLE") {
        console.log("\nCongratulations, that subdomain is available!");
        console.log("To register, run the command: `domains register`");
    }
}
