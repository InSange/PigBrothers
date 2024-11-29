import styled, { createGlobalStyle } from 'styled-components';

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

export const ButtonStyled = styled.button`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.secondary};
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) =>
      `${theme.colors.primary}CC`}; // 80% 투명도
  }
  &:active {
    background-color: ${({ theme }) => `${theme.colors.primary}`};
  }
`;
