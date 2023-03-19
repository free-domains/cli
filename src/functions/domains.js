const axios = require("axios");
const Conf = require("conf");

const account = new Conf();

module.exports = async function domains() {
    if(!account.has("username")) {
        console.log("You are not logged in!");
        console.log("To log in, run the command: `domains login`");
        return;
    }

    console.log(`Username: ${account.get("username")}`);
    console.log(`Email: ${account.get("email")}\n`);

    const email = account.get("email");

    let res;

    try {
        const request = await axios.get(`https://api.freesubdomains.org/lookup/user?email=${email}`);

        res = request;
    } catch(err) {
        res = err.response;
    }

    if(res.status === 500) return console.log("An error occurred, please try again later.");
    if(res.status === 404) return console.log("You do not own any domains.");

    const domains = res.data.subdomains;

    return console.log(`Your Domains:\n${domains.join("\n")}`);
}
