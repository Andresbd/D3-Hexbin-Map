import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import * as hb from "d3-hexbin";
import * as topojson from "topojson";
import us from "../data/states-albers-10m.json";
import walmart from "../data/walmart.tsv";

export const ChartComponent = () => {
  const countryChart = useRef();

  const width = 975;
  const heigh = 610;

  useEffect(() => {
    const parseDate = d3.timeParse("%x");

    const radius = d3.scaleSqrt().domain([0, 12]).range([0, 10]);

    const projection = d3.geoAlbersUsa().scale(1280).translate([480, 300]);

    const data = d3.tsvParse(walmart, (d) => {
      const p = projection(d);
      p.date = parseDate(d.date);
      return p;
    });

    const color = d3.scaleSequential(
      d3.extent(data, (d) => d.date),
      d3.interpolateSpectral
    );

    const svg = d3
      .select(countryChart.current)
      .append("svg")
      .attr("id", "chart")
      .attr("viewBox", [0, 0, 975, 610]);

    const hexbin = hb
      .hexbin()
      .extent([
        [0, 0],
        [width, heigh]
      ])
      .radius(10);

    svg
      .append("path")
      .datum(topojson.mesh(us, us.objects.states))
      .attr("fill", "none")
      .attr("stroke", "#777")
      .attr("stroke-width", 0.5)
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath());

    svg
      .append("g")
      .attr("class", "hexagon")
      .selectAll("path")
      .data(
        hexbin(data).sort(function (a, b) {
          return b.length - a.length;
        })
      )
      .enter()
      .append("path")
      .attr("d", function (d) {
        return hexbin.hexagon(radius(d.length));
      })
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
      .attr("fill", function (d) {
        return color(
          d3.median(d, function (d) {
            return +d.date;
          })
        );
      });

    return () => {
      svg.selectAll("*").remove();
    };
  }, [width, heigh]);

  return (
    <div
      id="chart"
      className={"svg-canvas"}
      style={{ position: "relative", textAlign: "center" }}
      ref={countryChart}
    />
  );
};
