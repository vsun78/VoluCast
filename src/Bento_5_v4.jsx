import React from "react";
import "./Bento.css";
import Chart from "./Chart";

const cells = [1, 2, 3, 4, 5];

export const Cell = ({ i = 0 }) => {
  return <div className="bento-cell">{i}</div>;
};

export default function Bento_5_v4() {
  return (
    <div className="bento-wrap">
      <div className="bento-grid">
        {cells.map((n, i) => {
          const extra = i === 1 ? "span-big" : i === 4 ? "span-last" : "";
          return (
            <div key={n} className={`bento-cell-wrapper ${extra}`}>
              {/* Put Chart in the first tile */}
              {i === 0 ? <Chart /> : <Cell i={i + 1} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

