// src/App.js
import React from "react";
import HeaderHero from "./HeaderHero";
import Bento_5_v4 from "./Bento_5_v4";
import StockTicker from "./Components/StockTicker";

export default function App() {
  return (
    <div className="dashboard">
      <HeaderHero />
      <Bento_5_v4 />
      <StockTicker />
    </div>
  );
}
