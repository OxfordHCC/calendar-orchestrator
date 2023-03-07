import * as React from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useSnackbar } from "notistack";

export default function CalendarInfoForm({ trigger, inputValues, setValues }) {
  const [warned, setWarned] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!warned) {
      for (const ics of inputValues.calendars) {
        if (!ics.endsWith(".ics")) {
          enqueueSnackbar(
            "Invalid .ics url (url should end with .ics). Click again to update regardlessly.",
            {
              variant: "error",
            }
          );
          setWarned(true);
          return;
        }
      }
    }

    trigger();
  };

  const handleUpdate = async (newValue) => {
    setValues({
      ...inputValues,
      ...newValue,
    });
  };

  React.useEffect(() => {
    setWarned(false);
  }, [inputValues]);

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Update .ics
      </Typography>
      <Typography variant="subtitle1">
        Paste your secret address in iCal format. You can find it it your google
        calendar settings.
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <TextField
              required={true}
              value={inputValues.calendars.join("\n")}
              onChange={(event) => {
                handleUpdate({ calendars: event.target.value.split("\n") });
              }}
              id="secret"
              label="secret address in iCal format"
              name="secret"
              fullWidth
              variant="standard"
            />
            <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
              Update
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
