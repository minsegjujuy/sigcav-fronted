import { styled } from "@mui/material/styles";
import MuiButton from "@mui/material/Button";

export const StyledButton = styled(MuiButton)(({ theme }) => ({
  borderRadius: "12px",
  padding: "10px 20px",
  textTransform: "none",

  "&.MuiButton-containedPrimary": {
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));
