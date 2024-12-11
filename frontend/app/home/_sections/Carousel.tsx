'use client';
import { useEffect, useState } from 'react';
import {
  CarouselButton,
  CarouselContainer,
  CarouselDots,
  CarouselImage,
  CarouselSlide,
  Dot,
} from '../_related/home.styled';

const images = [
  '/cut.png',
  '/cut-2.png',
  '/cut-3.png',
  '/cut-4.png',
  '/cut-5.png',
  '/cut-6.png',
];

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handlePrevClick = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNextClick = () => {
    if (currentSlide < images.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  return (
    <CarouselContainer>
      {images.map((image, index) => (
        <CarouselSlide key={index} active={currentSlide === index}>
          <CarouselImage src={image} alt={`Slide ${index + 1}`} />
        </CarouselSlide>
      ))}

      {currentSlide !== 0 && (
        <CarouselButton className='prev' onClick={handlePrevClick}>
          &#8249;
        </CarouselButton>
      )}
      {currentSlide !== images.length - 1 && (
        <CarouselButton className='next' onClick={handleNextClick}>
          &#8250;
        </CarouselButton>
      )}

      <CarouselDots>
        {images.map((_, index) => (
          <Dot
            key={index}
            active={currentSlide === index}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </CarouselDots>
    </CarouselContainer>
  );
};

export default Carousel;
