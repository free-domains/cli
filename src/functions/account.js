const Conf = require("conf");

const account = new Conf();

module.exports = function () {
    if(!account.has("username")) return console.log("You are not logged in!");

    console.log(`Username: ${account.get("username")}\nEmail: ${account.get("email")}\nToken: ${account.get("token")}`);
}