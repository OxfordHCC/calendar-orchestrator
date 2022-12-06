import { updateAvailability } from "../../orchestrator/api";

export default async function handler(request, response) {
  let { orchestrator_url, webid, issuer } = JSON.parse(request.body);

  const result = await updateAvailability(orchestrator_url, webid, issuer);
  if (result) {
    response.status(200).json(result);
  } else {
    response.status(400).json("");
  }
}
