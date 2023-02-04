const Conf = require("conf");

const account = new Conf();

module.exports = function account() {
    if(!account.has("username")) {
        console.log("You are not logged in!");
        console.log("To log in, run the command: `domains login`");
        return;
    }

    console.log(`Username: ${account.get("username")}\nEmail: ${account.get("email")}\nToken: ${account.get("token")}`);
}
