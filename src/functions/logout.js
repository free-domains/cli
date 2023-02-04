const Conf = require("conf");
const account = new Conf();

module.exports = function logout() {
    if(!account.has("username")) {
        console.log("You are not logged in!");
        console.log("To login, run the command: `domains login`")
        return;
    }

    account.delete("email");
    account.delete("token");
    account.delete("username");

    console.log("You have been logged out.");
}