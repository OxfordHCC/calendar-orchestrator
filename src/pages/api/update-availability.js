import updateAvailability from "../../orchestrator/update-availability";

export default async function handler(request, response) {
  let { webid, issuer } = JSON.parse(request.body);

  const result = await updateAvailability(webid, issuer);
  if (result) {
    response.status(200).json(result);
  } else {
    response.status(400).json("");
  }
}
