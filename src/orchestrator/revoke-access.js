import { deleteUser } from "./database";

async function revokeAccess(webid) {
  const result = await deleteUser(webid);
  console.log(result);

  return result;
}

export default revokeAccess;