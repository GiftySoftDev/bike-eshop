import { useState } from "react";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import { Analytics } from "@vercel/analytics/next";
const App = () => {
  const [activeBikeIndex, setActiveBikeIndex] = useState(0);

  return (
    <body className="max-w-[1600px] mx-auto">
      <Navbar activeBikeIndex={activeBikeIndex} />
      <Hero activeIndex={activeBikeIndex} setActiveIndex={setActiveBikeIndex} />

      <Analytics />
    </body>
  );
};

export default App;
