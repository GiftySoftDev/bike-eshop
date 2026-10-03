import React, { useState, useRef, useEffect } from "react";
// Import all bike images so we can reference them dynamically
import bike1 from "../assets/bike1.png";
import bike2 from "../assets/bike2.png";
import bike3 from "../assets/bike3.png";

const products = [
  { img: bike1, name: "VoltRider X" },
  { img: bike2, name: "TerraFlow" },
  { img: bike3, name: "TrailBlazer 500" },
];

const navItems = [
  "Shop Bikes",
  "Accessories",
  "Electric Bikes",
  "About Us",
  "Contact Us",
];

const headerActions = [
  { image: "/akar-icons--search.svg", alt: "A search icon" },
  { image: "/akar-icons--heart.svg", alt: "A heart icon" },
  { image: "/iconamoon--profile.svg", alt: "A profile icon" },
  { image: "/reicon--cart-filled.svg", alt: "A cart-filled icon" },
];

interface NavbarProps {
  activeBikeIndex?: number; // Optional prop to sync with Hero page
}

const Navbar: React.FC<NavbarProps> = ({ activeBikeIndex = 0 }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [ellipseLeft, setEllipseLeft] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navRefs = useRef<(HTMLLIElement | null)[]>([]);

  const ELLIPSE_WIDTH = 80; // w-20 = 80px

  // Adjust ellipse position when active index changes or window resizes
  useEffect(() => {
    const updateEllipse = () => {
      const currentItem = navRefs.current[activeIndex];
      if (currentItem && window.innerWidth >= 1024) {
        const leftPos =
          currentItem.offsetLeft +
          currentItem.offsetWidth / 2 -
          ELLIPSE_WIDTH / 2;
        setEllipseLeft(leftPos);
      }
    };

    updateEllipse();
    window.addEventListener("resize", updateEllipse);
    return () => window.removeEventListener("resize", updateEllipse);
  }, [activeIndex]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isSidebarOpen]);

  // Get the active bicycle image dynamically based on the hero's active bike index
  const activeBicycleImage = products[activeBikeIndex]?.img || bike1;

  return (
    <>
      <header className="relative flex items-center justify-between gap-3 text-nowrap w-full p-4 md:px-8 bg-transparent z-990 min-[90rem]:w-325 min-[125rem]:w-375 mx-auto">
        <h1 className="font-groote text-[24px] leading-none flex items-center shrink-0">
          RideHaus
        </h1>

        {/* Desktop Navigation (Hidden on Mobile/Tablet) */}
        <ul className="hidden lg:flex relative items-center gap-6 py-3 px-5 text-[14px] font-inter bg-white border border-gray-200 rounded-[50px] overflow-hidden">
          {/* Animated Ellipse Underline */}
          <div
            style={{ left: `${ellipseLeft}px` }}
            className="absolute top-[43.5px] w-20 h-8 rounded-[50%] bg-[radial-gradient(ellipse_at_center,#07D6FF_50%,#A3F3FF_80%,#E8FBFF_100%)] shadow-[0_0_12px_rgba(7,214,255,0.6)] blur-[0.5px] pointer-events-none transition-all duration-300 ease-in-out"
          />

          {navItems.map((item, index) => {
            const isActive = activeIndex === index;
            return (
              <li
                key={item}
                ref={(el) => {
                  navRefs.current[index] = el;
                }}
                onClick={() => setActiveIndex(index)}
                className={`cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "font-normal text-black"
                    : "font-semibold text-gray-700 hover:opacity-70"
                }`}
              >
                {item}
              </li>
            );
          })}
        </ul>

        {/* Actions & Hamburger Menu Container */}
        <div className="flex items-center gap-2 sm:gap-3 z-990 shrink-0">
          <ul className="flex items-center gap-4 sm:gap-6 md:gap-7.5">
            {headerActions.map((item, index) => (
              <li
                key={index}
                className="w-[15.97px] h-4 shrink-0 flex items-center justify-center cursor-pointer hover:opacity-70"
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-contain"
                />
              </li>
            ))}
          </ul>

          {/* Hamburger Menu Toggle (Visible only on Mobile/Tablet) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden relative w-5 h-4 flex flex-col justify-between items-center cursor-pointer hover:opacity-70 ml-1 sm:ml-2 shrink-0"
            aria-label="Open Navigation"
          >
            <span className="block w-full h-0.5 bg-black rounded" />
            <span className="block w-full h-0.5 bg-black rounded" />
            <span className="block w-full h-0.5 bg-black rounded" />
          </button>
        </div>
      </header>

      {/* Background Overlay for Sidebar */}
      <div
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-998 lg:hidden transition-opacity duration-300 ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Mobile/Tablet Sidebar Navigation */}
      <aside
        className={`fixed top-0 right-0 h-full w-70 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-99999 lg:hidden transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button Area */}
        <div className="flex justify-end pt-6 px-8">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-70"
            aria-label="Close Navigation"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="pt-10 px-8 flex-1">
          <ul className="flex flex-col gap-8 font-inter text-[18px]">
            {navItems.map((item, index) => {
              const isActive = activeIndex === index;
              return (
                <li
                  key={item}
                  onClick={() => {
                    setActiveIndex(index);
                    setIsSidebarOpen(false);
                  }}
                  className={`relative flex items-center gap-3 cursor-pointer transition-colors duration-200 ${
                    isActive
                      ? "font-medium text-black"
                      : "font-semibold text-gray-400 hover:text-black"
                  }`}
                >
                  <span>{item}</span>

                  {/* Dynamically display whichever bicycle is currently active on the hero page */}
                  {isActive && (
                    <img
                      src={activeBicycleImage}
                      alt="Active bike indicator"
                      className="w-7 h-4 object-contain shrink-0"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
