import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// import images
import bike1 from "../assets/bike1.png";
import bike2 from "../assets/bike2.png";
import bike3 from "../assets/bike3.png";

const products = [
  { img: bike1, name: "VoltRider X" },
  { img: bike2, name: "TerraFlow" },
  { img: bike3, name: "TrailBlazer 500" },
];

// Angle (in degrees) between neighbouring product names on the dial.
const NAME_SPREAD = 30;

const DIAL_ANGLES = [NAME_SPREAD, 0, -NAME_SPREAD];
const BALL_ANGLES = [-NAME_SPREAD, 0, NAME_SPREAD];

// Where each name sits on the arc (0% = far left, 50% = top, 100% = far right).
const NAME_OFFSETS = [
  `${50 - NAME_SPREAD / 1.8}%`,
  "50%",
  `${50 + NAME_SPREAD / 1.8}%`,
];

// How many extra pixels the dial circle grows by (diameter) on each screen size.
// A bigger circle = a wider, flatter-looking arc across the X axis, while the
// top of the dial is still a true circle (so the rotation, text and ball work).
const getDialGrow = () => {
  if (typeof window === "undefined") return 340;
  const w = window.innerWidth;
  if (w < 420) return 100;
  if (w < 640) return 140;
  if (w < 768) return 200;
  if (w < 1024) return 280;
  if (w < 1440) return 340;
  return 400;
};

const useDialGrow = () => {
  const [grow, setGrow] = React.useState(getDialGrow);
  useEffect(() => {
    const onResize = () => setGrow(getDialGrow());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return grow;
};

interface HeroProps {
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}

const Hero: React.FC<HeroProps> = ({ activeIndex, setActiveIndex }) => {
  const [direction, setDirection] = React.useState(1);
  const touchStartY = useRef<number | null>(null);

  // Dial geometry (all derived from one growth value so everything stays concentric)
  const grow = useDialGrow();
  const outerSize = 440 + grow; // dashed circle
  const innerSize = 400 + grow; // solid circle
  const textRadius = outerSize / 2 + 10; // product names sit just outside the dashed ring
  const svgSize = textRadius * 2 + 60;
  const c = svgSize / 2;
  const arcPath = `M ${c - textRadius},${c} A ${textRadius},${textRadius} 0 0,1 ${c + textRadius},${c}`;

  const activeRef = useRef(activeIndex);
  activeRef.current = activeIndex;

  // Wheel gesture bookkeeping
  const lockUntil = useRef(0);
  const lastWheelAt = useRef(0);
  const gestureHandled = useRef(false);

  // Single place that changes the slide (used by buttons, text, wheel and swipe)
  const goTo = React.useCallback(
    (newIndex: number, forcedDir?: 1 | -1) => {
      const current = activeRef.current;
      if (newIndex === current) return;
      setDirection(forcedDir ?? (newIndex > current ? 1 : -1));
      activeRef.current = newIndex;
      setActiveIndex(newIndex);
    },
    [setActiveIndex],
  );

  // Handle slide changing with direction tracking
  const changeIndex = (newIndex: number) => goTo(newIndex);

  // Scroll / Wheel / Swipe Navigation
  useEffect(() => {
    const step = (dir: 1 | -1) => {
      const last = products.length - 1;
      const current = activeRef.current;

      // At the last product and scrolling forward -> go back to the first
      if (dir === 1 && current === last) {
        goTo(0, 1);
        return;
      }

      goTo(Math.min(Math.max(current + dir, 0), last));
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Ignore tiny deltas (trackpad noise / momentum tail)
      if (Math.abs(e.deltaY) < 4) return;

      const now = performance.now();
      const startOfNewGesture = now - lastWheelAt.current > 120;
      lastWheelAt.current = now;

      // Still animating the previous slide
      if (now < lockUntil.current) return;

      // Trackpads keep firing momentum events after one swipe. Only the first
      // event of a gesture moves a slide; the rest are ignored until the wheel
      // has been quiet for a moment.
      if (!startOfNewGesture && gestureHandled.current) return;

      gestureHandled.current = true;
      lockUntil.current = now + 700;

      if (e.deltaY > 0)
        step(1); // Scroll down -> next bike
      else step(-1); // Scroll up -> previous bike
    };

    // Touch swipe support so phones/tablets can navigate too
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const delta = touchStartY.current - e.changedTouches[0].clientY;
      touchStartY.current = null;

      const now = performance.now();
      if (Math.abs(delta) < 40 || now < lockUntil.current) return;
      lockUntil.current = now + 700;

      if (delta > 0)
        step(1); // swipe up -> next bike
      else step(-1); // swipe down -> previous bike
    };

    const heroEl = document.getElementById("hero-section");
    if (heroEl) {
      heroEl.addEventListener("wheel", handleWheel, { passive: false });
      heroEl.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      heroEl.addEventListener("touchend", handleTouchEnd, { passive: true });
    }

    return () => {
      if (heroEl) {
        heroEl.removeEventListener("wheel", handleWheel);
        heroEl.removeEventListener("touchstart", handleTouchStart);
        heroEl.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [goTo]);

  const transitionConfig = {
    duration: 0.6,
    ease: [0.25, 1, 0.5, 1] as const,
  };

  // Slant Arc Motion Variants
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white select-none [--dial-s:0.62] [--dial-visible:132px] min-[420px]:[--dial-s:0.75] min-[420px]:[--dial-visible:160px] sm:[--dial-s:0.9] sm:[--dial-visible:192px] md:[--dial-s:1] md:[--dial-visible:213px]"
    >
      {/* Background Watermark */}{" "}
      <h2 className="font-groote absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[90px] sm:text-[140px] md:text-[125px] lg:text-[162px] xl:text-[210px] min-[90rem]:text-[210px] 2xl:text-[250px] opacity-5 text-center pointer-events-none select-none z-0 leading-none">
        RideHaus
      </h2>
      {/* Main Bike Image Stage Display */}
      <div
        className="absolute inset-x-0 top-0 mx-auto z-20 flex items-center justify-center w-full max-w-4xl pt-6"
        style={{ bottom: "var(--dial-visible)" }}
      >
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
            className="absolute w-auto max-w-[90vw] max-h-[92%] h-60 sm:h-80 md:h-90 lg:h-96 min-[90rem]:h-105 2xl:h-140 object-contain pointer-events-none drop-shadow-2xl origin-bottom"
          />
        </AnimatePresence>
      </div>
      {/* Center-Right Navigation Bullets */}
      <div className="absolute right-4 sm:right-4 min-[90rem]:right-20 top-1/2 -translate-y-20 z-30 flex flex-col gap-4">
        {products.map((_, index) => (
          <div
            key={index}
            onClick={() => changeIndex(index)}
            className={`w-4.5 h-4.5 border-2  rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110  ${
              activeIndex === index
                ? "border-[#07d6ff92] hover:border-[#07d6ff92]"
                : "border-gray-300 hover:border-[#07d6ff92]"
            }`}
          >
            <button
              aria-label={`Show ${products[index].name}`}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? "bg-[#07D6FF] scale-100"
                  : "bg-white hover:bg-[#07d6ff92] scale-75"
              }`}
            />
          </div>
        ))}
      </div>
      {/* Synchronized Circular Dial Mechanism */}
      <div
        className="absolute bottom-0 left-1/2 z-997 flex flex-col items-center justify-center font-inter bg-gray-50 rounded-full p-8.5"
        style={{
          translate:
            "-50% calc(100% * (1 + var(--dial-s)) / 2 - var(--dial-visible))",
          scale: "var(--dial-s)",
        }}
      >
        <motion.div
          animate={{ rotate: DIAL_ANGLES[activeIndex] }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="relative flex items-center justify-center origin-center"
        >
          {/* Curved SVG Text Ring for Product Names (Rotates with the dial so names scroll smoothly into position).
           */}
          <svg
            viewBox={`0 0 ${svgSize} ${svgSize}`}
            width={svgSize}
            height={svgSize}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 overflow-visible"
          >
            <path id="circleArc" d={arcPath} fill="transparent" />
            {products.map((product, index) => (
              <text
                key={product.name}
                className="text-xs font-inter font-semibold uppercase tracking-wider"
              >
                <textPath
                  href="#circleArc"
                  startOffset={NAME_OFFSETS[index]}
                  textAnchor="middle"
                  className={`cursor-pointer pointer-events-auto transition-all duration-300 ${
                    activeIndex === index
                      ? "fill-black font-bold text-sm"
                      : "fill-gray-400 hover:fill-gray-600"
                  }`}
                  onClick={() => changeIndex(index)}
                >
                  {product.name}
                </textPath>
              </text>
            ))}
          </svg>

          {/* Dashed & Solid Outer Dial Circles */}
          <div
            style={{ width: outerSize, height: outerSize }}
            className="p-6 border-3 border-dashed border-black rounded-full flex items-center justify-center bg-white"
          >
            <div
              style={{ width: innerSize, height: innerSize }}
              className="relative border-6 border-black rounded-full shadow-[0_4px_50px_rgba(0,0,0,0.25)] bg-white"
            >
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
