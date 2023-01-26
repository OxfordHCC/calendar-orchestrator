import { generateToken } from './solid-helper.js';

import {
    setUserToken,
    listUsers,
    getUserInfo,
} from "./database.js";
export {
    deleteUser,
    userInfoState,
    setCalendarSourceUrl as updateCalendarUrl
} from "./database.js";

import { updateAvailability } from './update-availability.js';
export { updateAvailability } from './update-availability.js';

export async function registerUser(email: string, password: string, webid: string, issuer: string) {
    const { id, secret } = await generateToken(email, password, issuer);

    if (id === undefined || secret === undefined) {
        return null;
    }
    console.log("Obtained CSS access id and token");

    const result = await setUserToken(webid, issuer, id, secret);
    console.log(result);

    return result;
}

export async function updateCalendarAll() {
    const users = await listUsers();
    users.map(async (user) => {
        const webid = user.webid;
        const info = await getUserInfo(webid);
        console.log("Updating", webid);
        if (info && info.issuer) {
            updateAvailability(webid, info.issuer);
            console.log("Done", webid);
        } else {
            console.warn(`No issuer field for ${webid}. Skipping`);
        }
    });
    return users;
}
