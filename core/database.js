let dbBackend;

if (typeof window === "undefined") {
  dbBackend = await import("./database_local.js");
  console.log("Running in Nodejs!");
} else {
  dbBackend = await import("./database_prisma.js");
  console.log("Running in browser!");
}

export async function setUserToken(webid, issuer, id, secret) {
  return await dbBackend.setUserToken(webid, issuer, id, secret);
}

export async function setCalendarSourceUrl(webid, ics) {
  return await dbBackend.setCalendarSourceUrl(webid, ics);
}

export async function deleteUser(webid) {
  return await dbBackend.deleteUser(webid);
}

export async function getUserInfo(webid) {
  return await dbBackend.getUserInfo(webid);
}

export async function userInfoState(webid) {
  return await dbBackend.userInfoState(webid);
}

export async function listUsers() {
  return await dbBackend.listUsers();
}
