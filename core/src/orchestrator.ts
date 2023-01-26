import fetch from "node-fetch";

import {
  setUserToken,
  deleteUser,
  setCalendarSourceUrl,
  listUsers,
  getUserInfo,
} from "./database.js";
export { userInfoState } from "./database.js";

import { updateAvailability } from './update-availability.js';
export { updateAvailability } from './update-availability.js';

export async function generateToken(email: string, password: string, webid: string, issuer: string) {
  console.log(`generateToken(${email}, ${password}, ${webid}, ${issuer})`)
  const token_response = await fetch(issuer + "idp/credentials/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    // The email/password fields are those of your account.
    // The name field will be used when generating the ID of your token.
    body: JSON.stringify({
      email: email,
      password: password,
      name: "my-token",
    }),
  });

  const { id, secret } = await token_response.json() as {
    id: string,
    secret: string,
  };
  console.log("my id: ", id, "my secret: ", secret);
  if (id === undefined || secret === undefined) {
    return null;
  }

  const result = await setUserToken(webid, issuer, id, secret);
  console.log(result);
  //response.json(result);

  return result;
}

export async function revokeAccess(webid: string) {
  const result = await deleteUser(webid);
  console.log(result);

  return result;
}

export async function updateIcs(ics: string, webid: string) {
  const result = await setCalendarSourceUrl(webid, ics);
  console.log(result);

  return result;
}

export async function updateAll() {
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
