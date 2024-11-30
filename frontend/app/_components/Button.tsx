import { ButtonHTMLAttributes } from 'react';
import { ButtonStyled } from './globalstyles';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'small' | 'medium' | 'large';
};

const Button = ({ size = 'medium', ...rest }: ButtonProps) => {
  return <ButtonStyled size={size} {...rest} />;
};

export default Button;
