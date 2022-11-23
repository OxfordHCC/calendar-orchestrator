import { userInfoState } from "../../orchestrator/database";

export default async function handler(request, response) {
  let webid = request.query.webid;

  const state = await userInfoState(webid);
  console.log(state);

  response.status(200).json(state);
}
