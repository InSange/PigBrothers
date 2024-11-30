import styled from 'styled-components';

export const LogoImage = styled.img`
  border-radius: 99999999px;
`;

export const Layout = styled.div`
  max-width: 600px;
  min-height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.secondary};
`;

export const LogoTitle = styled.div`
  font-size: 24px;
  font-weight: bold;
`;

export const HeaderStyled = styled.div`
  position: sticky;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background-color: ${({ theme }) => theme.colors.primary};
`;
