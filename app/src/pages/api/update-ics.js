import updateIcs from "../../orchestrator/update-ics";

export default async function handler(request, response) {
  let { ics, webid } = JSON.parse(request.body);

  const result = await updateIcs(ics, webid);

  response.status(200).json(result);
}
