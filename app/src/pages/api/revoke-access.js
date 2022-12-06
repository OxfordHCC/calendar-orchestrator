import { revokeAccess } from "../../orchestrator/api";

export default async function handler(request, response) {
  let { orchestrator_url, ics, webid } = JSON.parse(request.body);

  const result = await revokeAccess(orchestrator_url, webid);

  response.status(200).json(result);
}
