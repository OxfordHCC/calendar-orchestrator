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

const app = express();
const port = 3000;
const update_interval = 4 * 60 * 60 * 1000; // 4 hours

app.use(cors());
app.use(express.json()); // for parsing application/json

app.get('/', (req, res) => {
    res.send("The calendar orchestrator is running!");
});


app.get('/user', async (req: Request, res: Response) => {
    const req_content = req.params;
    const webid = req_content.webid;
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
    const req_content = req.params;
    const webid = req_content.webid;
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
    const result = await updateCalendarAll();
    res.send(result);
});

app.listen(port, () => {
    console.log(`Orchestrator app listening on port ${port}`);
});

updateCalendarAll();
setInterval(updateCalendarAll, update_interval);
