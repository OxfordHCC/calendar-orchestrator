//TODO: Optimize
//TODO: Handle concurrent requests

import * as fs from "fs";
import { getPodUrlAll } from "@inrupt/solid-client";
import { getAuthFetch, getOidcIssuer } from './solid-helper.js';
import { retrieveConfig, updateConfig, deleteConfig } from './config-pod.js';

const DB_PATH = "db.json";

let db_parsed = {};

function reloadDB() {
    db_parsed = JSON.parse(fs.readFileSync(DB_PATH).toString());
}

function writeDB() {
    fs.writeFileSync(DB_PATH, JSON.stringify(db_parsed));
}

if (fs.existsSync(DB_PATH)) {
    reloadDB();
} else {
    writeDB();
}

export interface UserInfo {
    issuer: string,
    id: string,
    secret: string,
    url?: string | null,
}

export async function setUserToken(webid: string, issuer: string, id: string, secret: string) {
    db_parsed[webid] = {
        issuer: issuer,
        token_id: id,
        token_secret: secret,
    };
    writeDB();

    return true;
}

export async function setCalendarSourceUrl(webid: string, ics: string) {
    if (webid in db_parsed) {
        const userInfo = await getUserInfo(webid, true);
        if (userInfo) {
            const { id, secret, issuer, url } = userInfo;
            let authFetch = await getAuthFetch(id, secret, issuer);
            const pod = (await getPodUrlAll(webid))[0];
            const conf = {cal: ics};
            await updateConfig(pod, conf, authFetch, url == null);
            return true;
        }
    }
    return false;
}

export async function deleteUser(webid: string) {
    if (webid in db_parsed) {
        const userInfo = await getUserInfo(webid, true);
        if (userInfo) {
            const { id, secret, issuer, url } = userInfo;
            if (url) {
                let authFetch = await getAuthFetch(id, secret, issuer);
                const pod = (await getPodUrlAll(webid))[0];
                try {
                    await deleteConfig(pod, authFetch); //TODO: What if failed? Needs to notify the user.
                } catch(e) {
                    return false;
                }
            }
        }
        delete db_parsed[webid];
        writeDB();

        return true;
    } else {
        return false;
    }
}

export async function getUserInfo(webid: string, includeConfig?: boolean): Promise<UserInfo | null> {
    if (webid in db_parsed) {
        const record = db_parsed[webid];
        let cal_url: string | null | undefined = undefined;
        if (includeConfig) {
            const issuer = await getOidcIssuer(webid, record.issuer);
            let authFetch = await getAuthFetch(record.token_id, record.token_secret, issuer);
            const pod = (await getPodUrlAll(webid))[0];
            await retrieveConfig(pod, authFetch)
            .then((conf) => {
                cal_url = conf.cal;
            })
            .catch((e) => {
                console.error(`Failed to retrieve config in Pod... Likely it does not exist`);
                cal_url = null;
            })
        }
        return {
            issuer: record.issuer,
            id: record.token_id,
            secret: record.token_secret,
            url: cal_url,
        }
    } else {
        return null;
    }
}

export async function userInfoState(webid: string) {
    const result = await getUserInfo(webid, true);

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
