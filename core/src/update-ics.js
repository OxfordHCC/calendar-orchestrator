import { setCalendarSourceUrl } from "./database.js";

async function updateIcs(ics, webid) {
  const result = await setCalendarSourceUrl(webid, ics);
  console.log(result);

  return result;
}


export default updateIcs;