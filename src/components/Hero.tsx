import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// import images
import bike1 from "../assets/bike1.png";
import bike2 from "../assets/bike2.png";
import bike3 from "../assets/bike3.png";

const products = [
  {
    img: bike1,
    name: "VoltRider X",
  },
  {
    img: bike2,
    name: "TerraFlow",
  },
  {
    img: bike3,
    name: "TrailBlazer 500",
  },
];

// Target rotation angles for the dial ring so each bike label aligns at the top
// Index 0: VoltRider X centered (+35deg)
// Index 1: TerraFlow centered (0deg)
// Index 2: TrailBlazer 500 centered (-35deg)
const DIAL_ANGLES = [35, 0, -35];

// Relative angles for the cyan indicator ball to dock under each product label on the dial rim
const BALL_ANGLES = [-35, 0, 35];

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward (next), -1 = backward (prev)
  const isScrolling = useRef(false);

  // Handle slide changing with direction tracking
  const changeIndex = (newIndex: number) => {
    if (newIndex === activeIndex) return;
    setDirection(newIndex > activeIndex ? 1 : -1);
    setActiveIndex(newIndex);
  };

  // Scroll / Wheel Event Navigation with throttling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isScrolling.current) return;
      isScrolling.current = true;

      if (e.deltaY > 0) {
        // Scroll down -> next bike
        setActiveIndex((prev) => {
          const next = Math.min(prev + 1, products.length - 1);
          if (next !== prev) setDirection(1);
          return next;
        });
      } else if (e.deltaY < 0) {
        // Scroll up -> previous bike
        setActiveIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          if (next !== prev) setDirection(-1);
          return next;
        });
      }

      // Cooldown timer to prevent runaway scrolling
      setTimeout(() => {
        isScrolling.current = false;
      }, 700);
    };

    const heroEl = document.getElementById("hero-section");
    if (heroEl) {
      heroEl.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (heroEl) heroEl.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Smooth, non-spring transition configuration
  const transitionConfig = {
    duration: 0.6,
    ease: [0.25, 1, 0.5, 1] as const,
  };

  // Slant Arc Motion Variants without Spring Physics
  const bikeVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "-90vw" : "90vw",
      y: "90vh",
      rotate: dir > 0 ? -45 : 45,
      opacity: 0,
      scale: 0.35,
      zIndex: 20,
    }),
    center: {
      x: 0,
      y: 0,
      rotate: 0,
      opacity: 1,
      scale: 1,
      zIndex: 10,
      transition: {
        x: transitionConfig,
        y: transitionConfig,
        rotate: transitionConfig,
        scale: transitionConfig,
        opacity: { duration: 0.3, ease: "easeOut" },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "90vw" : "-90vw",
      y: "90vh",
      rotate: dir > 0 ? 45 : -45,
      scale: 0.25,
      opacity: [1, 1, 0],
      zIndex: 0,
      transition: {
        x: transitionConfig,
        y: transitionConfig,
        rotate: transitionConfig,
        scale: transitionConfig,
        opacity: {
          duration: 0.6,
          times: [0, 0.95, 1],
          ease: "linear",
        },
      },
    }),
  };

  return (
    <section
      id="hero-section"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white select-none"
    >
      {/* Background Watermark */}
      <h2 className="font-groote absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[210px] 2xl:text-[250px] opacity-5 text-center pointer-events-none select-none z-0 leading-none">
        RideHaus
      </h2>

      {/* Main Bike Image Stage Display */}
      <div className="relative z-20 flex items-center justify-center -translate-y-16 2xl:-translate-y-24 w-full max-w-4xl h-105">
        <AnimatePresence custom={direction} mode="sync">
          <motion.img
            key={activeIndex}
            src={products[activeIndex].img}
            alt={products[activeIndex].name}
            custom={direction}
            variants={bikeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute w-auto h-105 2xl:h-140 object-contain pointer-events-none drop-shadow-2xl origin-bottom"
          />
        </AnimatePresence>
      </div>

      {/* Center-Right Navigation Bullets */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4">
        {products.map((_, index) => (
          <div
            key={index}
            onClick={() => changeIndex(index)}
            className="w-5 h-5 border-2 border-black rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
          >
            <button
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? "bg-black scale-100"
                  : "bg-white hover:bg-gray-200 scale-75"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Synchronized Circular Dial Mechanism */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[60%] md:translate-y-[50%] lg:translate-y-[70%] 2xl:translate-y-[55%] z-997 flex flex-col items-center justify-center font-inter bg-gray-50 rounded-full p-8.5">
        <motion.div
          animate={{ rotate: DIAL_ANGLES[activeIndex] }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="relative flex items-center justify-center origin-center"
        >
          {/* Curved SVG Text Ring for Product Names (Rotates with the dial so names scroll smoothly into position) */}
          <svg
            viewBox="0 0 520 280"
            className="absolute -top-7.5 left-1/2 -translate-x-1/2 w-130 h-70 pointer-events-none z-20 overflow-visible"
          >
            <path
              id="circleArc"
              d="M 20,260 A 240,240 0 0,1 500,260"
              fill="transparent"
            />
            <text className="text-xs font-inter font-semibold uppercase tracking-wider">
              <textPath
                href="#circleArc"
                startOffset="15%"
                className={`cursor-pointer pointer-events-auto transition-all duration-300 ${
                  activeIndex === 0
                    ? "fill-black font-bold text-sm"
                    : "fill-gray-400 hover:fill-gray-600"
                }`}
                onClick={() => changeIndex(0)}
              >
                {products[0].name}
              </textPath>
              <textPath
                href="#circleArc"
                startOffset="50%"
                textAnchor="middle"
                className={`cursor-pointer pointer-events-auto transition-all duration-300 ${
                  activeIndex === 1
                    ? "fill-black font-bold text-sm"
                    : "fill-gray-400 hover:fill-gray-600"
                }`}
                onClick={() => changeIndex(1)}
              >
                {products[1].name}
              </textPath>
              <textPath
                href="#circleArc"
                startOffset="85%"
                textAnchor="end"
                className={`cursor-pointer pointer-events-auto transition-all duration-300 ${
                  activeIndex === 2
                    ? "fill-black font-bold text-sm"
                    : "fill-gray-400 hover:fill-gray-600"
                }`}
                onClick={() => changeIndex(2)}
              >
                {products[2].name}
              </textPath>
            </text>
          </svg>

          {/* Dashed & Solid Outer Dial Circles */}
          <div className="p-6 border-3 border-dashed border-black rounded-full w-110 h-110 flex items-center justify-center bg-white">
            <div className="relative border-6 border-black rounded-full w-100 h-100 shadow-[0_4px_50px_rgba(0,0,0,0.25)] bg-white">
              {/* Active Indicator Ball - Glides along the rim to dock beneath the active bike name */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ rotate: BALL_ANGLES[activeIndex] }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[linear-gradient(-90deg,#07D6FF_0%,#0388A3_100%)] shadow-[0_2px_8px_rgba(3,136,163,0.6)] z-30" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
