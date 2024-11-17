import 'smooth-scroll/dist/smooth-scroll.polyfills';
import smoothScroll from './components/smooth-scroll';

// INITIALIZATION OF SMOOTH SCROLL
// =======================================================
let scroll = new SmoothScroll('a[href*="#"]', {
  animationTime: 800,
  stepSize: 75,
  accelerationDelta: 30,
  accelerationMax: 2,
  keyboardSupport: true,
  arrowScroll: 50,
  pulseAlgorithm: true,
  pulseScale: 4,
  pulseNormalize: 1,
  touchpadSupport: true,
});
