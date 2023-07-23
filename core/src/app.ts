import express from "express";
import { Request, Response} from "express";

import cors from "cors";

import {
    registerUser,
    updateAvailability,
    updateCalendarUrl,
    deleteUser,
    userInfoState,
    updateCalendarAll,
} from "./orchestrator.js";

import { attestWebidPossession } from "./solid-helper.js";
import { RequestMethod } from "@solid/access-token-verifier";

export async function attestWebidPossessionFromRequest(claimedWebid: string, req: Request) {
    const authorizationHeader = req.header('authorization')!;
    const dpopHeader = req.header('DPoP')!;
    const requestMethod = req.method as RequestMethod;
    const _host = req.header('x-forwarded-host') ?? req.get('host');
    const _proto = req.header('x-forwarded-proto') ?? req.protocol;
    const requestUrl = `${_proto}://${_host}${pathPrefix}${req.originalUrl}`;
    return await attestWebidPossession(claimedWebid, authorizationHeader, dpopHeader, requestMethod, requestUrl);
}

const app = express();
const port = 3100;
const update_interval = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Either empty, or something like `/orchestrator`.
 * This is added to the requestUrl for Webid attestation. 
 * A particular use case is being proxied into a path, but later removed it when entering into the orchestrator service.
 */
const pathPrefix = '';


const MSG_WEBID_UNMATCH = "It is forbidden to modify someone else's record. Check your input."

app.use(cors());
app.use(express.json()); // for parsing application/json

app.get('/', (req, res) => {
    res.send("The calendar orchestrator is running!");
});


app.get('/user', async (req: Request, res: Response) => {
    const req_content = req.query;
    const webid = req_content.webid as string;

    if (!await attestWebidPossessionFromRequest(webid, req)) {
        res.status(401);
        res.send(MSG_WEBID_UNMATCH);
        return;
    }

    const result = await userInfoState(webid);
    res.send(result);
});

app.post('/user', async (req: Request, res: Response) => {
    const req_content = req.body;
    const webid = req_content.webid;
    const issuer = req_content.issuer;
    const email = req_content.email;
    const password = req_content.password;
    const cal_url = req_content.cal_url;

    if (!await attestWebidPossessionFromRequest(webid, req)) {
        res.status(401);
        res.send(MSG_WEBID_UNMATCH);
        return;
    }

    try {
        if (email && password && webid) {
            const res1 = await registerUser(email, password, webid, issuer);
            if (res1 == null) {
                res.status(500);
                res.json({ error: "Could not generate token" });
            } else if (!res1) {
                res.status(500);
                res.json({ error: "Failed to store user to database" });
            } else {
                res.send();
            }
            return;
        }
        if (webid && cal_url) {
            const res2 = await updateCalendarUrl(webid, cal_url);
            if (res2 == undefined) {
                res.status(500);
                res.send("User not registered");
            } else {
                res.send();
            }
            return;
        }
        if (webid) {
            const res3: string | undefined = await updateAvailability(webid, issuer);
            if (res3 == undefined) {
                res.status(500);
                res.send("User not registered");
            } else {
                res.send();
            }
            return;
        }
        res.status(400);
        res.send("Invalid request: insufficient or incorrect data");
    } catch (e) {
        res.status(500);
        res.send((e as Error).message);
    }
});

app.delete('/user', async (req: Request, res: Response) => {
    const req_content = req.query;
    const webid = req_content.webid as string;

    if (!await attestWebidPossessionFromRequest(webid, req)) {
        res.status(401);
        res.send(MSG_WEBID_UNMATCH);
        return;
    }

    let result: true | undefined;
    try {
        result = await deleteUser(webid);
    } catch (e) {
        res.status(500);
        res.send((e as Error).message);
    }
    if (result == undefined) {
        res.status(500);
        res.send("User not registered");
    } else {
        res.send();
    }
});

app.get('/status', async (req, res) => {
    const errors = await updateCalendarAll(true);
    res.send(errors);
});

app.listen(port, () => {
    console.log(`Orchestrator app listening on port ${port}`);
});

updateCalendarAll();
setInterval(updateCalendarAll, update_interval);
