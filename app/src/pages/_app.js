import '../../styles/globals.css'
import Head from "next/head";
import { SessionProvider } from "@inrupt/solid-ui-react";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { SnackbarProvider } from "notistack";
import Header from "../components/Header";
import { BaseUrlProvider } from "../context/BaseUrlContex";

function MyApp({ Component, pageProps }) {
  return (
    <BaseUrlProvider>
      <SessionProvider restorePreviousSession={true}>
        <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
          <Head>
            <title>Orchestrator Configurer</title>
          </Head>
          <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <Header title="Orchestrator Configurer" />
            <Box sx={{ flexGrow: 1, pt: 3, pl: 3 }}>
              <Toolbar />
              <Component {...pageProps} />
            </Box>
          </Box>
        </SnackbarProvider>
      </SessionProvider>
    </BaseUrlProvider>
  );
}

export default MyApp
