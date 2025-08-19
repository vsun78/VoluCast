
import React from "react";
import Bento_5_v4 from "./Bento_5_v4";
import StockTicker from "./Components/StockTicker";

export default function DashboardPage() {
  return (
    <div className="dashboard">
      <Bento_5_v4 />
      <StockTicker />
    </div>
  );
}
