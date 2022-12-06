import express from "express";

import { listUsers, getUserInfo } from "./database.js";
import generateToken from "./generate-token.js";
import updateAvailability from "./update-availability.js";
import updateIcs from "./update-ics.js";
import revokeAccess from "./revoke-access.js";
import { userInfoState } from "./database.js";

async function updateAll() {
    const users = await listUsers();
    users.map(async (user) => {
        const webid = user.webid;
        const info = await getUserInfo(webid);
        console.log("Dealing with", webid);
        if (info.issuer) {
            updateAvailability(webid, info.issuer);
            console.log(webid);
        } else {
            console.warn(`No issuer field for ${webid}. Skipping`);
        }
    });
    return users;
}

const app = express();
const port = 3000;
const update_interval = 4 * 60 * 60 * 1000; // 4 hours

app.use(express.json()); // for parsing application/json

app.get('/', (req, res) => {
    res.send("The calendar orchestrator is running!");
});


app.get('/user', async (req, res) => {
    const req_content = req.params;
    const webid = req_content.webid;
    const result = await userInfoState(webid);
    if (!result) {
        res.status(500);
        res.send(result);
        return
    }
    res.send(result);
});

app.post('/user', async (req, res) => {
    const req_content = req.body;
    const webid = req_content.webid;
    const issuer = req_content.issuer;
    const email = req_content.email;
    const password = req_content.password;
    const cal_url = req_content.cal_url;
    if (email && password && webid && issuer) {
        const res1 = await generateToken(email, password, webid, issuer);
        if (!res1) {
            res.status(401);
            res.json({ error: "Could not generate token" });
        } else {
            res.send();
        }
        return;
    }
    if (webid && cal_url) {
        const res2 = await updateIcs(cal_url, webid);
        if (!res2) {
            res.status(401);
            res.json({ error: "Could not set calendar URL" });
        } else {
            res.send();
        }
        return;
    }
    if (webid && issuer) {
        const res3 = updateAvailability(webid, issuer);
        if (!res3) {
            res.status(500);
            res.send(res3);
        } else {
            res.send();
        }
        return;
    }
    res.status(500);
    res.send("Invalid request -- insufficient or incorrect data");
});

app.delete('/user', async (req, res) => {
    const req_content = req.body;
    const webid = req_content.webid;
    const result = await revokeAccess(webid);
    if (result) {
        res.send(result);
    } else {
        res.status(500);
        res.send();
    }
});

app.get('/status', async (req, res) => {
    const result = await updateAll();
    res.send(result);
});

app.listen(port, () => {
    console.log(`Orchestrator app listening on port ${port}`);
});

updateAll();
setInterval(updateAll, update_interval);
