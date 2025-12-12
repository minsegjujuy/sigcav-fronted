import { Box, TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

export const PaginationContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2)
}));

export const PageInput = styled(TextField)(({ theme }) => ({
  width: "80px",
  "& input": {
    textAlign: "center"
  }
}));
