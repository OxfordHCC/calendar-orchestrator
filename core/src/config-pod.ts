/**
 * Code related to getting and setting user configuration stored in Pod.
 * That currently contains the calendar URL, but will contain more (e.g. transformation).
 */

import { getSolidDataset, saveSolidDatasetAt, deleteSolidDataset, getThingAll, getThing, getStringNoLocale, createSolidDataset, buildThing, createThing, setThing } from "@inrupt/solid-client";
import { universalAccess } from "@inrupt/solid-client";

export interface Config {
    cal: string,
}

const N = 'urn:cal:orchestrator#';
const P_CAL = `${N}calendar`;
const C_CONF = `${N}Config`;
const P_A = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

const CONF_THING = 'config';

function configLocation(pod: string) {
    return `${pod}calendar_orchestrator/config.ttl`;
}

export async function retrieveConfig(pod: string, authFetch) {
    const myDataset = await getSolidDataset(
        configLocation(pod),
        { fetch: authFetch }
    );
    const things = getThingAll(myDataset);
    let cal_url;
    for (const thing of things) {
        const cal = getStringNoLocale(thing, P_CAL)
        if (cal) {
            cal_url = cal;
            break;
        }
    }
    return {cal: cal_url};
}

export async function updateConfig(pod: string, config: Config, authFetch, create?: boolean) {
    let myDataset, configThing;
    const save = async () => {
        return await saveSolidDatasetAt(
            configLocation(pod),
            myDataset,
            { fetch: authFetch }
        );
    }
    if (create) {
        myDataset = createSolidDataset();
        myDataset = await save();
        // setConfigPermission(pod, authFetch);
        configThing = buildThing(createThing({name: CONF_THING}))
                .setUrl(P_A, C_CONF)
                .build();
    } else {
        myDataset = await getSolidDataset(configLocation(pod), { fetch: authFetch });
        configThing = getThing(myDataset, `${configLocation(pod)}#${CONF_THING}`);
    }
    configThing = buildThing(configThing)
        .setStringNoLocale(P_CAL, config.cal)
        .build();
    myDataset = setThing(myDataset, configThing);
    myDataset = await save();
    return myDataset;
}

// Note: Not working, due to https://github.com/inrupt/solid-client-js/issues/1549
// export async function setConfigPermission(pod: string, authFetch) {
//     await universalAccess.setPublicAccess(
//         configLocation(pod),
//         { read: false, write: false },
//         { fetch: authFetch }
//     );
// }

export async function deleteConfig(pod: string, authFetch) {
    return await deleteSolidDataset(
        configLocation(pod),
        { fetch: authFetch }           // fetch function from authenticated session
    );
}
