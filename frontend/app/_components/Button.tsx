import { ButtonHTMLAttributes } from 'react';
import { ButtonStyled } from './globalstyles';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary';
};

const Button = ({
  size = 'medium',
  color = 'primary',
  ...rest
}: ButtonProps) => {
  return <ButtonStyled size={size} color={color} {...rest} />;
};

export default Button;
