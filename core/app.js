import { listUsers, getUserInfo, setUserToken } from "./database.js";
import generateToken from "./generate-token.js";
import updateAvailability from "./update-availability.js";
import updateIcs from "./update-ics.js";

async function main() {
    const users = await listUsers();
    users.map(async (user) => {
        const webid = user.webid;
        const info = await getUserInfo(webid);
        console.log("Dealing with", webid);
        if (info.issuer) {
            updateAvailability(webid, info.issuer);
            console.log(webid);
        } else {
            console.warn(`No issuer field for ${webid}. Skipping`);
        }
    });
}

main();
