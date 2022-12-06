import { userInfoState } from "../../orchestrator/api";

export default async function handler(request, response) {
  let orchestrator_url = request.query.orchestrator_url;
  let webid = request.query.webid;

  const state = await userInfoState(orchestrator_url, webid);
  console.log(state);

  response.status(200).json(state);
}
