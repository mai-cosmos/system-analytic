import 'smooth-scroll/dist/smooth-scroll.polyfills'
import smoothScroll from './components/smooth-scroll';
import scrollTopButton from './components/scroll-top-button';

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

// INTRO
const intro = document.querySelector("#section-intro");
const introText = document.querySelector("#intro-text");

// SCROLLMAGIC
const controller = new ScrollMagic.Controller();
const sceneDurationPinIntro = 3500;
const sceneDurationIntroText = 1000;

let sceneAnimationRings = new ScrollMagic.Scene({
  triggerElement: intro,
  offset: -1250,
  triggerHook: 0
})
  //.addIndicators()
  //.setPin(intro)
  .addTo(controller);

let scenePinIntro = new ScrollMagic.Scene({
  duration: sceneDurationPinIntro,
  triggerElement: intro,
  triggerHook: 0
})
  //.addIndicators()
  .setPin(intro)
  .addTo(controller);

let sceneIntroTextShow = new ScrollMagic.Scene({
  duration: sceneDurationIntroText,
  triggerElement: intro,
  offset: -400,
  triggerHook: 0
})
  //.addIndicators()
  .addTo(controller)
  .setTween(
    gsap.fromTo(
      introText,
      {opacity: `0`},
      {opacity: `1`}
    )
  );

let sceneIntroTextHide = new ScrollMagic.Scene({
  duration: sceneDurationIntroText,
  triggerElement: intro,
  offset: 1200,
  triggerHook: 0
})
  //.addIndicators()
  .addTo(controller)
  .setTween(
    gsap.to(
      introText,
      {opacity: `0`}
    )
  );


// CANVAS
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight + 80;

const canvas = document.getElementById("canvas-intro");
canvas.width = windowWidth;
canvas.height = windowHeight;

const context = canvas.getContext("2d");

let imageWidth = windowWidth;
let imageHeight = imageWidth * 9/16; //16x9

if(imageHeight < windowHeight) {
  imageHeight = windowHeight;
  imageWidth = imageHeight * 16/9;
}

const frameCount = 250;
const frames = [];
let frameIndex = 0;

const currentFrame = (index) => (
  `assets/img/frames/${index.toString().padStart(4, '0')}.jpg`
  //`https://www.apple.com/105/media/us/airpods-pro/2019/1299e2f5_9206_4470_b28e_08307a42f19b/anim/sequence/large/01-hero-lightpass/${index.toString().padStart(4, '0')}.jpg`
)
const preloadImages = () => {
  for (let i = 1; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    frames.push(img);
  }
};

//Frames Animation
let accelamount = 1;
let scrollpos = 0;
let delay = 0;

sceneAnimationRings.on("update", e => {
  scrollpos = (e.scrollPos - e.startPos)/ 20;
});

// const update = () => {
//   delay += (scrollpos - delay) * accelamount;
//   frameIndex = Math.round(delay);
//
//   context.clearRect(0,0, canvas.width, canvas.height);
//   if(frames[frameIndex])
//     context.drawImage(frames[frameIndex], windowWidth/2 - imageWidth/2 , windowHeight/2 - imageHeight/2, imageWidth, imageHeight);
//   requestAnimationFrame(update);
// }

setInterval(() => {
  delay += (scrollpos - delay) * accelamount;
  frameIndex = Math.round(delay);

  context.clearRect(0,0, canvas.width, canvas.height);
  if(frames[frameIndex])
    context.drawImage(frames[frameIndex], windowWidth/2 - imageWidth/2 , windowHeight/2 - imageHeight/2, imageWidth, imageHeight);
}, 0);


preloadImages();
//update();