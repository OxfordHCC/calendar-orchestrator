import fetch from "node-fetch";
import {
  createSolidDataset,
  getPodUrlAll,
  getSolidDataset,
  getThingAll,
  removeThing,
  createAcl,
  setPublicDefaultAccess,
  setPublicResourceAccess,
  saveAclFor,
  saveSolidDatasetAt,
  hasResourceAcl,
  getSolidDatasetWithAcl,
  universalAccess,
  setAgentDefaultAccess,
  setAgentResourceAccess,
} from "@inrupt/solid-client";

import { getAuthFetch } from './auth.js';
import { convertIcsToRdf } from "./ics-to-rdf-converter.js";
import { getUserInfo } from "./database.js";

async function updateAvailability(webid, issuer) {
  const { id, secret, url } = await getUserInfo(webid);
  if (id, secret, url) {
    let authFetch = await getAuthFetch(id, secret, issuer);
    const calendarRdf = await convertIcsToRdf(url);

    let success = await updateAvailabilityInPod(webid, authFetch, calendarRdf);
    if (success) {
      return calendarRdf;
      // response.status(200).json(calendarRdf);
    } else {
      return undefined;
    }
  } else {
    console.log("Something wrong updating availability...");
    return undefined;
  }
}

const updatePodAvailabilityPut = async (availabilityUrl, authFetch, rdf) => {
  const response = await authFetch(availabilityUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "text/turtle",
    },
    body: rdf,
  });
};

const updatePodStorageSpace = async (webID, authFetch) => {
  const storageLocation = webID.substring(0, webID.indexOf("profile") + 8);
  const response = await authFetch(webID, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/sparql-update",
    },
    body: `
    PREFIX space: <http://www.w3.org/ns/pim/space#>
    INSERT DATA {
      <#me> space:storage <${storageLocation}>.
   }`,
  });
};

const updateWebIdAvailability = async (availabilityUrl, webID, authFetch) => {
  const response = await authFetch(webID, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/sparql-update",
    },
    body: `
    PREFIX schema: <http://schema.org/>
    PREFIX knows: <https://data.knows.idlab.ugent.be/person/office/#>
    INSERT DATA {
      <#me> knows:hasAvailabilityCalendar <#availability-calendar>.
      <#availability-calendar> schema:url "${availabilityUrl}".
   }`,
  });
};

const updateAvailabilityInPod = async (webID, authFetch, rdf) => {
  await updatePodStorageSpace(webID, authFetch);

  const mypods = await getPodUrlAll(webID, { fetch: authFetch });
  const SELECTED_POD = mypods[0];
  const availabilityUrl = `${SELECTED_POD}availability`;
  console.log("My availability url: ");
  console.log(availabilityUrl);

  // Fetch or create a new availability calendar
  let myAvailabilityCalendar;

  try {
    // Attempt to retrieve the availability calendar in case it already exists.
    myAvailabilityCalendar = await getSolidDataset(availabilityUrl, {
      fetch: authFetch,
    });

    // Clear the list to override the whole list
    let items = getThingAll(myAvailabilityCalendar);
    items.forEach((item) => {
      myAvailabilityCalendar = removeThing(myAvailabilityCalendar, item);
    });
  } catch (error) {
    if (typeof error.statusCode === "number" && error.statusCode === 404) {
      // if not found, create a new SolidDataset (i.e., the reading list)
      console.log("Creating a solid dataset...");
      myAvailabilityCalendar = createSolidDataset();
    } else {
      console.error(error.message);
    }
  }
  try {
    console.log("Saving dataset...");
    await saveSolidDatasetAt(availabilityUrl, myAvailabilityCalendar, {
      fetch: authFetch,
    });

    const READ_ACCESS = {
      read: true,
      write: false,
      append: false,
      control: false,
    };

    const FULL_ACCESS = {
      read: true,
      write: true,
      append: true,
      control: true,
    };
    console.log("Updating availability data...");
    await updatePodAvailabilityPut(availabilityUrl, authFetch, rdf);
    console.log("Updating Web ID URL...");
    await updateWebIdAvailability(availabilityUrl, webID, authFetch);

    console.log("Fetching solid dataset with acl...");
    const availabilityWithAcl = await getSolidDatasetWithAcl(availabilityUrl, {
      fetch: authFetch,
    });

    console.log("Setting up acl...");
    if (!hasResourceAcl(availabilityWithAcl)) {
      console.log("Creating acl...");
      let calendarAcl = createAcl(availabilityWithAcl);
      calendarAcl = setPublicDefaultAccess(calendarAcl, READ_ACCESS);
      calendarAcl = setPublicResourceAccess(calendarAcl, READ_ACCESS);

      // Set full access for the user itself
      calendarAcl = setAgentDefaultAccess(calendarAcl, webID, FULL_ACCESS);
      calendarAcl = setAgentResourceAccess(calendarAcl, webID, FULL_ACCESS);

      await saveAclFor(availabilityWithAcl, calendarAcl, { fetch: authFetch });
    } else {
      console.log("Has acl already!");
      universalAccess
        .setPublicAccess(
          availabilityUrl,
          { read: true, write: false },
          { fetch: authFetch }
        )
        .then((newAccess) => {
          if (newAccess === null) {
            console.log("Could not load access details for this Resource.");
          } else {
            console.log("Returned Public Access:: ", JSON.stringify(newAccess));
          }
        });
    }
    console.log("Finished creating/updating pod!");
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default updateAvailability;
