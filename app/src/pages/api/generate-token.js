import generateToken from "../../orchestrator/generate-token";

export default async function handler(request, response) {
  let { email, password, webid, issuer } = JSON.parse(request.body);

  const result = await generateToken(email, password, webid, issuer);

  response.status(200).json(result);
}
