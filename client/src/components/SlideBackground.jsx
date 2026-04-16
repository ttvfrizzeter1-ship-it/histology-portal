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
  const [nextReady, setNextReady] = useState(false);
  const overlayOpacity = opacity ?? 0;
  const slideBrightness = brightness ?? (isLight ? 0.94 : 0.82);
  const slideSaturation = saturation ?? (isLight ? 1 : 0.96);
  const darkOverlayOpacity = Math.min(0.35, isLight ? overlayOpacity * 0.65 : overlayOpacity + 0.08);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIdx = (current + 1) % SLIDES.length;
      setNext(nextIdx);

      // Start fade only when the next image is actually loaded.
      const img = new Image();
      img.onload = () => {
        setNextReady(true);
        setCrossfading(true);
        setTimeout(() => {
          setCurrent(nextIdx);
          setNext(null);
          setNextReady(false);
          setCrossfading(false);
        }, 1200);
      };
      img.onerror = () => {
        // Fallback: switch slide without animation if preload fails.
        setCurrent(nextIdx);
        setNext(null);
        setNextReady(false);
        setCrossfading(false);
      };
      img.src = SLIDES[nextIdx];
    }, 5000);
    return () => clearInterval(interval);
  }, [current]);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', background:'#050505' }}>
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
            opacity: crossfading && nextReady ? 1 : 0,
            transition: 'opacity 1.2s ease',
            filter: `saturate(${slideSaturation}) brightness(${slideBrightness})`,
          }}
        />
      )}
      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `rgba(0,0,0,${darkOverlayOpacity})`,
      }} />
    </div>
  );
}
