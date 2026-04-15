import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const SLIDES = [
  '/slides/slide0.jpg',
  '/slides/slide1.jpg',
  '/slides/slide2.jpg',
  '/slides/slide3.jpg',
  '/slides/slide4.jpg',
  '/slides/slide5.jpg',
  '/slides/slide6.jpg',
  '/slides/slide7.png',
];

export default function SlideBackground({ opacity, brightness, saturation }) {
  const { isLight } = useTheme();
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(null);
  const [crossfading, setCrossfading] = useState(false);
  const overlayOpacity = opacity ?? 0;
  const slideBrightness = brightness ?? (isLight ? 0.94 : 0.82);
  const slideSaturation = saturation ?? (isLight ? 1 : 0.96);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIdx = (current + 1) % SLIDES.length;
      setNext(nextIdx);
      setCrossfading(true);
      // After crossfade completes, make next the current
      setTimeout(() => {
        setCurrent(nextIdx);
        setNext(null);
        setCrossfading(false);
      }, 1200);
    }, 5000);
    return () => clearInterval(interval);
  }, [current]);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }}>
      {/* Current slide */}
      <img
        src={SLIDES[current]}
        alt=""
        style={{
          position: 'absolute', inset:0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          opacity: crossfading ? 0 : 1,
          transition: crossfading ? 'opacity 1.2s ease' : 'none',
          filter: `saturate(${slideSaturation}) brightness(${slideBrightness})`,
        }}
      />
      {/* Next slide fading in */}
      {next !== null && (
        <img
          src={SLIDES[next]}
          alt=""
          style={{
            position: 'absolute', inset:0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: crossfading ? 1 : 0,
            transition: 'opacity 1.2s ease',
            filter: `saturate(${slideSaturation}) brightness(${slideBrightness})`,
          }}
        />
      )}
      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `rgba(255,255,255,${overlayOpacity})`,
      }} />
    </div>
  );
}
