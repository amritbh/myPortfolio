import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import "./ElevationProfile.css";
import { ElevationPoint } from "../../portfolio";

interface ElevationProfileProps {
  data: ElevationPoint[];
  accentColor: string;
  theme?: any;
}

interface TooltipData {
  point: ElevationPoint | null;
  x: number;
  y: number;
  visible: boolean;
}

const ElevationProfile: React.FC<ElevationProfileProps> = ({ data, accentColor, theme }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData>({
    point: data && data.length > 0 ? data[0] : null,
    x: 0,
    y: 0,
    visible: false,
  });

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return;

    // Clear previous renders
    d3.select(svgRef.current).selectAll("*").remove();

    // Chart dimensions
    const margin = { top: 40, right: 20, bottom: 90, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.day) as [number, number])
      .range([0, width]);

    const yMin = d3.min(data, (d) => d.altitude) || 0;
    const yMax = d3.max(data, (d) => d.altitude) || 0;
    const yPadding = (yMax - yMin) * 0.15;

    const yScale = d3
      .scaleLinear()
      .domain([Math.max(0, yMin - yPadding), yMax + yPadding])
      .range([height, 0]);

    // Defs for gradient
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "elevation-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", accentColor)
      .attr("stop-opacity", 0.4);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", accentColor)
      .attr("stop-opacity", 0.0);

    // Area generator
    const area = d3
      .area<ElevationPoint>()
      .x((d) => xScale(d.day))
      .y0(height)
      .y1((d) => yScale(d.altitude))
      .curve(d3.curveMonotoneX);

    // Draw area
    svg
      .append("path")
      .datum(data)
      .attr("class", "elevation-area")
      .attr("fill", "url(#elevation-gradient)")
      .attr("d", area);

    // Line generator
    const line = d3
      .line<ElevationPoint>()
      .x((d) => xScale(d.day))
      .y((d) => yScale(d.altitude))
      .curve(d3.curveMonotoneX);

    // Draw line
    svg
      .append("path")
      .datum(data)
      .attr("class", "elevation-line")
      .attr("stroke", accentColor)
      .attr("d", line);

    // X Axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .attr("class", "elevation-axis")
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(data.map(d => d.day))
          .tickFormat((d) => {
            const point = data.find((p) => p.day === Number(d));
            return point ? `Day ${d} — ${point.campName}` : `Day ${d}`;
          })
      )
      .selectAll("text")
      .style("fill", theme?.secondaryText || "rgba(255,255,255,0.7)")
      .style("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "0.15em")
      .attr("transform", "rotate(-45)");

    // Y Axis (Grid lines only)
    svg
      .append("g")
      .attr("class", "elevation-grid")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => "")
      );

    // Y Axis Labels
    svg
      .append("g")
      .attr("class", "elevation-axis")
      .call(d3.axisLeft(yScale).ticks(5).tickSize(0).tickPadding(10))
      .selectAll("text")
      .style("fill", theme?.secondaryText || "rgba(255,255,255,0.7)")
      .text((d) => `${d}m`);

    // Draw points
    svg
      .selectAll(".elevation-point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "elevation-point")
      .attr("cx", (d) => xScale(d.day))
      .attr("cy", (d) => yScale(d.altitude))
      .attr("r", 4)
      .attr("fill", accentColor)
      .on("mousemove", (event, d) => {
        // Calculate coordinates relative to the container for the HTML tooltip
        const [x, y] = d3.pointer(event, containerRef.current);
        setTooltip({
          point: d,
          x,
          y,
          visible: true,
        });
      })
      .on("mouseleave", () => {
        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Optional annotations (e.g. 4000m line)
    const significantAltitudes = [2000, 3000, 4000].filter((alt) => alt > yMin && alt < yMax);
    
    significantAltitudes.forEach(alt => {
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", yScale(alt))
        .attr("x2", width)
        .attr("y2", yScale(alt))
        .attr("stroke", "rgba(255,255,255,0.1)")
        .attr("stroke-dasharray", "2,4");
        
      svg.append("text")
        .attr("x", width - 5)
        .attr("y", yScale(alt) - 5)
        .attr("text-anchor", "end")
        .attr("class", "altitude-annotation")
        .text(`${alt}m`);
    });

  }, [data, accentColor, theme]);

  if (!data || data.length === 0) return null;

  return (
    <div className="elevation-profile-container" ref={containerRef} data-testid="elevation-profile">
      <h3 style={{ color: theme?.text || "#fff", marginBottom: "1rem" }}>Elevation Profile</h3>
      <svg ref={svgRef} className="elevation-profile-svg" />
      
      {/* HTML Tooltip overlay */}
      <div 
        className={`elevation-tooltip ${tooltip.visible ? "visible" : ""}`}
        style={{ left: tooltip.x, top: tooltip.y }}
        data-testid="elevation-tooltip"
      >
        {tooltip.point && (
          <>
            <div className="tooltip-day" style={{ color: accentColor }}>Day {tooltip.point.day}</div>
            <div className="tooltip-camp">{tooltip.point.campName}</div>
            <div className="tooltip-altitude">📍 {tooltip.point.altitude}m</div>
            {tooltip.point.note && <div className="tooltip-note">{tooltip.point.note}</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default ElevationProfile;
