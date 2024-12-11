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
  margin-top: 10vh;
  padding-inline: 32px;
`;

export const Carousel = styled.div`
  width: 100%;
  height: 40vh;
  flex-shrink: 0;
  background-color: #fff;
`;

export const CarouselContainer = styled.div`
  width: 100%;
  max-width: 800px;
  height: 400px;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
`;

export const CarouselSlide = styled.div<{ active: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: ${(props) => (props.active ? 1 : 0)};
  transition: opacity 0.5s ease-in-out;
`;

export const CarouselImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const CarouselButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 1rem;
  cursor: pointer;
  z-index: 2;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }

  &.prev {
    left: 10px;
  }

  &.next {
    right: 10px;
  }
`;

export const CarouselDots = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
`;

export const Dot = styled.button<{ active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: ${(props) =>
    props.active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
`;
