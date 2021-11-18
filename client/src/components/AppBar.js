import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import React from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";

const mdTheme = createTheme();
const theme = { mdTheme };

export default function AppBar() {
  return (
    <ThemeProvider>
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          overflow: "auto",
          padding: "2rem",
        }}
      >
        <span style={{ fontWeight: "bold", fontSize: "1.4rem" }}>
          HEDVIG Contracts
        </span>
      </Box>
    </ThemeProvider>
  );
}
