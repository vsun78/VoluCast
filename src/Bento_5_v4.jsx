import React from "react";
import "./Bento.css";
import Chart from "./Chart";
import WeatherImpactCard from "./WeatherImpactCard";
import StarBorder from "./StarBorder"; // keep colors as-is
import TimeLocationCard from "./TimeLocationCard";
import "./TimeLocationCard.css";                   

const cells = [1, 2, 3, 4, 5];

export const Cell = ({ i = 0 }) => <div>{i}</div>;

export default function Bento_5_v4() {
  return (
    <div className="bento-wrap">
      <div className="bento-grid">
        {cells.map((n, i) => {
          const extra = i === 1 ? "span-big" : i === 4 ? "span-last" : "";

          return (
            <div key={n} className={`bento-cell-wrapper ${extra}`}>
              <StarBorder
                as="div"
                color={i % 2 === 0 ? "cyan" : "violet"} 
                speed="6s"
                thickness={3}
              >
                <div className="bento-cell">
                  {i === 0 ? (
                    <Chart />
                  ) : i === 3 ? (
                    <WeatherImpactCard />
                  ) : i === 2 ? (
                    <TimeLocationCard />  
                  ) : (
                    <Cell i={i + 1} />
                  )}
                </div>
              </StarBorder>
            </div>
          );
        })}
      </div>
    </div>
  );
}
