import React, { useEffect, useState } from "react";
import { useSession } from "@inrupt/solid-ui-react";
import CustomAlert from "../components/Alert";
import Configuration from "../components/Configuration";
import { SnackbarProvider } from "notistack";
import { UrlProvider } from "../context/UrlContext";
import { useBaseUrl } from "../context/BaseUrlContex";

export default function Meetings() {
  const { session, sessionRequestInProgress } = useSession();
  const [baseUrl, setBaseUrl] = useBaseUrl();

  useEffect(() => {
    setBaseUrl(window.location.origin + window.location.pathname);
  }, [setBaseUrl]);

  useEffect(() => {
    const webID = session.info.webId;
  }, [session.info.webId]);

  if (sessionRequestInProgress) {
    console.log(sessionRequestInProgress);
    return <p>Loading...</p>;
  }

  return (
    <>
      <UrlProvider>
        <SnackbarProvider maxSnack={1} preventDuplicate>
            <Configuration />
          </SnackbarProvider>
      </UrlProvider>
    </>
  );
}
