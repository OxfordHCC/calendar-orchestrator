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

/**
 * The representation of user information retrieved from the (orchestrator's) database.
 * It (should) only have the entries that exist in the database.
 * But right now, for compatibility, it may also have the calendar URL(s). This will be removed in the future.
 * TODO: (After that of `getUserInfo()`) Remove URLs of the calendars.
 * TODO: Store URL for calendar configuration.
 */
export interface UserInfo {
    issuer: string,
    id: string,
    secret: string,
    url?: string[] | null,
}

/**
 * Register the user and store the access token for the user.
 * The access token is based on that for CSS (Community Solid Server). Other Solid server implementations may have their own mechanism that is not yet supported.
 * TODO: Support all Solid services. Maybe through using WebID for the orchestrator.
 * @param webid The WebID of the user.
 * @param issuer The issuer of this WebID.
 * @param id The token ID obtained from the Solid service (compatible with CSS).
 * @param secret The token secret obtain from the Solid service (compatible with CSS).
 * @returns `true` if no error is raised.
 */
export async function setUserToken(webid: string, issuer: string, id: string, secret: string) {
    db_parsed[webid] = {
        issuer: issuer,
        token_id: id,
        token_secret: secret,
    };
    writeDB();

    return true;
}

/**
 * Set the external calendar URL(s) for the given user (WebID).
 * This is for compatibility. The orchestrator should not directly modify the configuration. User the App should be preferred.
 * TODO: (After that of `getUserInfo()`) Remove this function.
 * @param webid The WebID of the user, whose calendar URLs are to be modified/replaced.
 * @param ics The new calendar URL(s) (string or string array).
 * @returns `true` if success; `undefined` if user not registered.
 */
export async function setCalendarSourceUrl(webid: string, ics: string[]|string) {
    if (webid in db_parsed) {
        const userInfo = await getUserInfo(webid, true);
        if (userInfo) {
            const { id, secret, issuer, url } = userInfo;
            let authFetch = await getAuthFetch(id, secret, issuer);
            const pod = (await getPodUrlAll(webid))[0];
            if (!Array.isArray(ics)) {
                ics = [ics];
            }
            const conf = {calendars: ics};
            await updateConfig(pod, conf, authFetch, url == null);
            return true;
        }
    }
    return undefined;
}

/**
 * De-register the user (WebID) from the orchestrator.
 * TODO: Handle different status differently, which may require changing return values.
 * @param webid The WebID to de-register.
 * @returns `true` if success; `undefined` if user does not exist (not registered).
 */
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
                    throw new Error("Error deleting user config in Pod");
                }
            }
        }
        delete db_parsed[webid];
        writeDB();

        return true;
    } else {
        return undefined;
    }
}

/**
 * Get the information for the given user (WebID) that is stored in the orchestrator.
 * For compatibility, it also supports including the calendar URL(s) by passing `true` to the `includeConfig` parameter.
 * TODO: (After that from `userInfoState()`) Stop getting the configuration, and remove the `includeConfig` parameter.
 * @param webid The WebID of the user to see information.
 * @param includeConfig Whether to include the configuration content (i.e. the calendar URLs) or not.
 * @returns The user information, or `null` indicating user does not exist.
 */
export async function getUserInfo(webid: string, includeConfig?: boolean): Promise<UserInfo | null> {
    if (webid in db_parsed) {
        const record = db_parsed[webid];
        let cal_url: string[] | null | undefined = undefined;
        if (includeConfig) {
            const issuer = await getOidcIssuer(webid, record.issuer);
            let authFetch = await getAuthFetch(record.token_id, record.token_secret, issuer);
            const pod = (await getPodUrlAll(webid))[0];
            await retrieveConfig(pod, authFetch)
            .then((conf) => {
                cal_url = conf.calendars;
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

/**
 * Tell whether some information (or the user) exists for the user or not.
 * TODO: Remove `ics` from return.
 * @param webid The WebID of the user.
 * @returns Whether certain information exist for the user or not, as an object. Currently supports `user` for existence of the user (i.e. registered or not), and `ics` for configuration existence.
 */
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

/**
 * List all registered users with the orchestrator.
 * TODO: Maybe return array of webids?
 * @returns The list of users, represented as `{webid: WEBID}` where `WEBID` is the actual WebID (string).
 */
export async function listUsers() {
    return Object.keys(db_parsed).map(webid => { return {webid: webid} });
}
