import revokeAccess from "../../orchestrator/revoke-access";

export default async function handler(request, response) {
  let { ics, webid } = JSON.parse(request.body);

  const result = await revokeAccess(webid);

  response.status(200).json(result);
}
