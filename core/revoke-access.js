import { deleteUser } from "./database.js";

async function revokeAccess(webid) {
  const result = await deleteUser(webid);
  console.log(result);

  return result;
}

export default revokeAccess;