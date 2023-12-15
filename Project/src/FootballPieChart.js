// FootballPieChart.js
import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

const FootballPieChart = ({ data, column, samplingMethod }) => {
  const chartRef = useRef();

  useEffect(() => {
    if (data.length > 0) {
      createPieChart();
    }
  }, [data, column, samplingMethod]);

  const createPieChart = () => {
    d3.select(chartRef.current).selectAll('*').remove();

    // Determine the sampled data based on the selected sampling method
    let sampledData;

    switch (samplingMethod) {
      // Implement sampling logic for the pie chart if needed
      default:
        sampledData = data; // Default to using the original data
        break;
    }

    const screenWidth = window.innerWidth * 0.75;
    const screenHeight = window.innerHeight * 0.75;
    const width = Math.min(screenWidth, screenHeight);
    const height = width;
    const radius = Math.min(width, height) / 2;

    // Create SVG
    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Create a pie chart
    const pie = d3.pie().value((d) => d[column]);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const arcs = svg.selectAll('arc').data(pie(sampledData)).enter().append('g').attr('class', 'arc');

    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (_, i) => d3.schemeCategory10[i % 10]) // Use color scale for fill
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut);

    // Tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'rgba(255, 255, 255, 0.9)')
      .style('border', '1px solid #ddd')
      .style('padding', '10px')
      .style('border-radius', '5px')
      .style('font-size', '14px')
      .style('color', '#333')
      .style('box-shadow', '0 0 10px rgba(0, 0, 0, 0.1)');

    function handleMouseOver(event, d) {
      // Highlight the arc on mouseover
      d3.select(this).attr('fill', 'rgba(75, 192, 192, 1)');

      // Show tooltip
      tooltip
        .html(`<strong>${column}:</strong> ${d.data[column]}`)
        .style('top', event.pageY - 10 + 'px')
        .style('left', event.pageX + 10 + 'px')
        .style('visibility', 'visible');
    }

    function handleMouseOut(_, d) {
      // Reset the color on mouseout
      d3.select(this).attr('fill', (_, i) => d3.schemeCategory10[i % 10]);

      // Hide tooltip
      tooltip.style('visibility', 'hidden');
    }
  };

  return <div ref={chartRef}></div>;
};

export default FootballPieChart;
