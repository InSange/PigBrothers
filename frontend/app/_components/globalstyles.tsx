import styled, { createGlobalStyle, css } from 'styled-components';
import { ButtonProps } from './Button';

const GlobalStyle = createGlobalStyle`
  html,
  body {
    color: ${({ theme }) => theme.colors.primary};
    padding: 0;
    margin: 0;
    background-color:${({ theme }) => theme.colors.defaultBackground};
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    box-sizing: border-box;
  }
`;

export default GlobalStyle;

export const ButtonStyled = styled.button<ButtonProps>`
  width: 100%;
  background-color: ${({ theme, color }) =>
    color === 'primary' ? theme.colors.primary : theme.colors.gray};
  color: #fff;
  border: none;
  border-radius: 4px;
  ${({ size }) =>
    size === 'small' &&
    css`
      padding: 4px 16px;
    `}
  ${({ size }) =>
    size === 'medium' &&
    css`
      padding: 8px 16px;
    `}
  ${({ size }) =>
    size === 'large' &&
    css`
      padding: 12px 24px;
    `}
  cursor: pointer;
  &:hover {
    background-color: ${({ theme, color }) =>
      `${color === 'primary' ? theme.colors.primary : theme.colors.gray}CC`};
  }
  &:active {
    background-color: ${({ theme, color }) =>
      `${color === 'primary' ? theme.colors.primary : theme.colors.gray}`};
  }
`;

export const ContentContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
