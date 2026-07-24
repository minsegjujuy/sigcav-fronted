import { styled, DialogContent, DialogActions } from "@mui/material";

export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  fontSize: "1rem",
  color: theme.palette.text.primary,
  whiteSpace: "pre-line",
}));

export const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2),
  justifyContent: "flex-end",
  gap: theme.spacing(1.5),
}));