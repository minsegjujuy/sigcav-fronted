import { StyledButton } from "./Button.styles";
import type { ButtonProps } from "./Button.types";

const Button =  ({ children, ...props }: ButtonProps) => {
  return (
    <StyledButton {...props}>
      {children}
    </StyledButton>
  )
}

export default Button