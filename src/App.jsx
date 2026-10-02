import Hero from "./components/Hero";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <body className="max-w-[1600px] mx-auto">
      <Navbar />
      <Hero />
    </body>
  );
};

export default App;
