import { generateToken } from "../../orchestrator/api";

export default async function handler(request, response) {
  let { orchestrator_url, email, password, webid, issuer } = JSON.parse(request.body);

  const result = await generateToken(orchestrator_url, email, password, webid, issuer);

  response.status(200).json(result);
}
