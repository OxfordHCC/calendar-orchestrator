import React, { useState } from "react";
import CustomAlert from "../components/Alert";
import Configuration from "../components/Configuration";
import { SnackbarProvider } from "notistack";
import { UrlProvider } from "../context/UrlContext";

export default function Meetings() {
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
