import * as React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export default function BasicInfoForm({ inputValues, setValues }) {

  const handleUpdate = async (newValue) => {
    setValues({
      ...inputValues,
      ...newValue,
    });
  }

  return (
    <>
      <Typography variant="subtitle1">
        Want to configure your availability calendar? Enter your WebID and Pod
        provider information here. Then we can go through relevant steps for it.
      </Typography>
      <Box component="form">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              value={inputValues.orchestratorUrl}
              onChange={(event) => {handleUpdate({orchestratorUrl: event.target.value})}}
              id="orchestrator_url"
              name="orchestrator_url"
              label="Orchestrator URL"
              fullWidth
              autoComplete="orchestrator_url"
              variant="standard"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              value={inputValues.webid}
              onChange={(event) => {handleUpdate({webid: event.target.value})}}
              id="webid"
              name="webid"
              label="WebID"
              fullWidth
              autoComplete="webid"
              variant="standard"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              value={inputValues.issuer}
              onChange={(event) => {handleUpdate({issuer: event.target.value})}}
              id="provider"
              name="provider"
              label="WebID Provider"
              type="provider"
              fullWidth
              autoComplete="current-provider"
              variant="standard"
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
