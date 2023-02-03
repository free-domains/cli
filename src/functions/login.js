const Conf = require("conf");
const { createOAuthDeviceAuth } = require("@octokit/auth-oauth-device");
const { Octokit } = require("@octokit/core");

const account = new Conf();

module.exports = async function () {
    if(account.has("username")) {
        console.log(`You are already logged in as ${account.get("username")}!`);
        console.log("To log out, run the command: `domains logout`");
        return;
    }

    const auth = createOAuthDeviceAuth({
        clientType: "oauth-app",
        clientId: "767f7b97e8c3e5ac4c46",
        scopes: ["public_repo, user:email"],
        onVerification(verification) {      
            console.log("Open the URL: %s", verification.verification_uri);
            console.log("Enter code: %s", verification.user_code);
        }
    })

    const tokenAuthentication = await auth({ type: "oauth" });

    account.set("token", tokenAuthentication.token);

    const octokit = new Octokit({ auth: tokenAuthentication.token });

    const res1 = await octokit.request("GET /user", {});
    account.set("username", res1.data.login);

    const res2 = await octokit.request("GET /user/emails", {});

    if (res2.data[0].email.endsWith("@users.noreply.github.com")) {
        account.set("email", res2.data[1].email);
    } else {
        account.set("email", res2.data[0].email);
    }

    console.log(`\nLogged in as: ${account.get("username")} <${account.get("email")}>`);
}