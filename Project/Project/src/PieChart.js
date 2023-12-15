import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';

const PieChart = ({ data, column, samplingMethod }) => {
  const chartRef = useRef();

  useEffect(() => {
    if (data.length > 0) {
      createPieChart();
    }
  }, [data, column, samplingMethod]);

  const createPieChart = () => {
    d3.select(chartRef.current).selectAll('*').remove();

    let sampledData;

    switch (samplingMethod) {
      default:
        sampledData = data; 
        break;
    }

    const screenWidth = window.innerWidth * 0.75;
    const screenHeight = window.innerHeight * 0.75;
    const width = Math.min(screenWidth, screenHeight);
    const height = width;
    const radius = Math.min(width, height) / 2;

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value((d) => d[column]);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const arcs = svg.selectAll('arc').data(pie(sampledData)).enter().append('g').attr('class', 'arc');

    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (_, i) => d3.schemeCategory10[i % 10])
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut);

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
      d3.select(this).attr('fill', 'rgba(75, 192, 192, 1)');

      tooltip
        .html(`<strong>${column}:</strong> ${d.data[column]}`)
        .style('top', event.pageY - 10 + 'px')
        .style('left', event.pageX + 10 + 'px')
        .style('visibility', 'visible');
    }

    function handleMouseOut(_, d) {
      d3.select(this).attr('fill', (_, i) => d3.schemeCategory10[i % 10]);

      tooltip.style('visibility', 'hidden');
    }
  };

  return <div ref={chartRef}></div>;
};

export default PieChart;
