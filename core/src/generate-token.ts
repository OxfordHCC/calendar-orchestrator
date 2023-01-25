import fetch from "node-fetch";
import { setUserToken } from "./database.js";

async function generateToken(email: string, password: string, webid: string, issuer: string) {
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

export default generateToken;
