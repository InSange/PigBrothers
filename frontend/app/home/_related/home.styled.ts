import { ContentContainer } from '@/app/_components/globalstyles';
import styled from 'styled-components';

export const HeaderLogoTitle = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: #fff;
`;

export const HomeContentContainer = styled(ContentContainer)`
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 20vh;
  padding-inline: 32px;
`;

export const Carousel = styled.div`
  width: 100%;
  height: 40vh;
  flex-shrink: 0;
  background-color: #fff;
`;
