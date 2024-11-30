import React, { ButtonHTMLAttributes } from 'react';
import { ButtonStyled } from './globalstyles';

const Button = ({ ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <ButtonStyled {...rest} />;
};

export default Button;
