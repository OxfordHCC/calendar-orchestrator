import * as React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export default function BasicInfoForm({ trigger }) {
  const handleSubmit = async (event) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    let orchestrator_url = data.get("orchestrator_url");
    let webid = data.get("webid");
    let provider = data.get("provider");

    trigger(orchestrator_url, webid, provider);
  };

  return (
    <>
      <Typography variant="subtitle1">
        Want to configure your availability calendar? Enter your WebID and Pod
        provider information here. Then we can go through relevant steps for it.
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              defaultValue="http://localhost:3000"
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
              id="provider"
              name="provider"
              label="WebID Provider"
              type="provider"
              fullWidth
              autoComplete="current-provider"
              variant="standard"
            />
            <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
              Submit Basic Info
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
