import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";

export interface ButtonProps extends MuiButtonProps {
  children?: React.ReactNode;
  loading?: boolean;
  rounded?: boolean;
}
