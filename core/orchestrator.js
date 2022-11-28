import { listUsers } from "./database.js";
import generateToken from "./generate-token.js";
import updateAvailability from "./update-availability.js";

async function main() {
    const users = await listUsers();
    console.log(users);
}

main();