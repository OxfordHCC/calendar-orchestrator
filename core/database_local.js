//TODO: Optimize
//TODO: Handle concurrent requests

import * as fs from "fs";

const DB_PATH = "db.json";

let db_parsed = {};

function reloadDB() {
  db_parsed = JSON.parse(fs.readFileSync(DB_PATH));
}

function writeDB() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db_parsed));
}

if (fs.existsSync(DB_PATH)) {
  reloadDB();
} else {
  writeDB();
}

export async function setUserToken(webid, issuer, id, secret) {
  db_parsed[webid] = {
    issuer: issuer,
    token_id: id,
    token_secret: secret,
    ics_url: null,
  };
  writeDB();

  return true;
}

export async function setCalendarSourceUrl(webid, ics) {
  if (webid in db_parsed) {
    db_parsed[webid].ics_url = ics;
    writeDB();

    return true;
  } else {
    return false;
  }
}

export async function deleteUser(webid) {
  if (webid in db_parsed) {
    delete db_parsed[webid];
    writeDB();

    return true;
  } else {
    return false;
  }
}

export async function getUserInfo(webid) {
  if (webid in db_parsed) {
    const record = db_parsed[webid];
    return {
      issuer: record.issuer,
      id: record.token_id,
      secret: record.token_secret,
      url: record.ics_url,
    }
  } else {
    return null;
  }
}

export async function userInfoState(webid) {
  const result = await getUserInfo(webid);

  if (result == null) {
    return {
      user: false,
      ics: false,
    };
  }

  if (result.url == null) {
    return {
      user: true,
      ics: false,
    };
  }

  return {
    user: true,
    ics: true,
  }
}

export async function listUsers() {
  return Object.keys(db_parsed).map(webid => { return {webid: webid} });
}
