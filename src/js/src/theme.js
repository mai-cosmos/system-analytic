import 'smooth-scroll/dist/smooth-scroll.polyfills'

import scrollTopButton from './components/scroll-top-button';
import smoothScroll from './components/smooth-scroll';

// INITIALIZATION OF SMOOTH SCROLL
// =======================================================
new SmoothScroll('a[href*="#"]', {
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
let intro;
let introText;

// SCROLLMAGIC
let controller;
const sceneDurationPinIntro = 3500;
const sceneDurationIntroText = 1000;

let sceneAnimationRings;
let scenePinIntro;
let sceneIntroTextShow;
let sceneIntroTextHide;

// CANVAS
let canvas;
let context;

const frameCount = 250;
const frames = [];
let frameIndex = 0;

let windowWidth;
let windowHeight;

let imageWidth;
let imageHeight;

//Frames Animation
let accelamount = 1;
let scrollpos = 0;
let delay = 0;

const init = () => {
  intro = document.querySelector("#section-intro");
  introText = document.querySelector("#intro-text");

  canvas = document.getElementById("canvas-intro");
  context = canvas.getContext("2d");

  controller?.destroy();
  controller = new ScrollMagic.Controller();

  sceneAnimationRings?.destroy();
  sceneAnimationRings = new ScrollMagic.Scene({
    triggerElement: intro,
    offset: -1250,
    triggerHook: 0
  })
    //.addIndicators()
    //.setPin(intro)
    .addTo(controller);

  scenePinIntro?.destroy();
  scenePinIntro = new ScrollMagic.Scene({
    duration: sceneDurationPinIntro,
    triggerElement: intro,
    triggerHook: 0
  })
    //.addIndicators()
    .setPin(intro)
    .addTo(controller);

  sceneIntroTextShow?.destroy();
  sceneIntroTextShow = new ScrollMagic.Scene({
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

  sceneIntroTextHide?.destroy();
  sceneIntroTextHide = new ScrollMagic.Scene({
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

  sceneAnimationRings.on("update", e => {
    scrollpos = (e.scrollPos - e.startPos)/ 20;
  });

  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;

  canvas.width = windowWidth;
  canvas.height = windowHeight;

  imageWidth = windowWidth;
  imageHeight = imageWidth * 9/16; //16x9

  if(imageHeight < windowHeight) {
    imageHeight = windowHeight;
    imageWidth = imageHeight * 16/9;
  }

  setInterval(() => {
    delay += (scrollpos - delay) * accelamount;
    frameIndex = Math.round(delay);

    context.clearRect(0,0, canvas.width, canvas.height);
    if(frames[frameIndex])
      context.drawImage(frames[frameIndex], windowWidth/2 - imageWidth/2 , windowHeight/2 - imageHeight/2, imageWidth, imageHeight);
  }, 0);

  intro.classList.remove('opacity-0')
}

async function loadImage(url, elem) {
  return new Promise((resolve, reject) => {
    elem.onload = () => resolve(elem);
    elem.onerror = reject;
    elem.src = url;
  });
}

const preloadImages = async () => {
  for (let i = 1; i < frameCount; i++) {
    const img = new Image();
    const loadImg = await loadImage(`assets/img/frames/${i.toString().padStart(4, '0')}.jpg`, img);
    frames.push(loadImg);
  }
  init();
};

window.addEventListener('load', () => setTimeout(() => preloadImages()));

window.addEventListener('resize', () => {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;

  canvas.width = windowWidth;
  canvas.height = windowHeight;

  imageWidth = windowWidth;
  imageHeight = imageWidth * 9/16; //16x9

  if(imageHeight < windowHeight) {
    imageHeight = windowHeight;
    imageWidth = imageHeight * 16/9;
  }
});

const swiperThreeElements = (swiperContainer) => {
  return {
    speed: 600,
    slidesPerView: 1.25,
    slidesPerGroup: 1,
    //spaceBetween: 15,
    loop: false,
    // pagination: {
    //   el:  `${swiperContainer} .swiper-pagination`,
    //   clickable: true
    // },
    breakpoints: {
      740: {
        //spaceBetween: 24,
        slidesPerView: 3,
        slidesPerGroup: 3
      }
    }
  };
};

new Swiper('#swiper-who', swiperThreeElements('#swiper-who'));
