import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './Chart.css';

const LineChart = ({ data, xAxisColumn, yAxisColumn, samplingMethod }) => {
  const chartRef = useRef();

  useEffect(() => {
    if (data.length > 0) {
      createLineChart();
    }
  }, [data, xAxisColumn, yAxisColumn, samplingMethod]);

  const createLineChart = () => {
    d3.select(chartRef.current).selectAll('*').remove();

    let sampledData;

    switch (samplingMethod) {

      default:
        sampledData = data; 
        break;
    }

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const screenWidth = window.innerWidth * 0.75;
    const screenHeight = window.innerHeight * 0.75;
    const width = screenWidth - margin.left - margin.right;
    const height = screenHeight - margin.top - margin.bottom;

    sampledData.sort((a, b) => d3.ascending(+a[xAxisColumn], +b[xAxisColumn]));

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(sampledData, (d) => parseFloat(d[xAxisColumn])))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(sampledData, (d) => parseFloat(d[yAxisColumn]))])
      .range([height, 0]);

    const svg = d3
      .select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const line = d3
      .line()
      .x((d) => xScale(parseFloat(d[xAxisColumn])))
      .y((d) => yScale(parseFloat(d[yAxisColumn])));

    svg
      .append('path')
      .datum(sampledData)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line);

    svg
      .selectAll('circle')
      .data(sampledData)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(parseFloat(d[xAxisColumn])))
      .attr('cy', (d) => yScale(parseFloat(d[yAxisColumn])))
      .attr('r', 4)
      .attr('fill', 'steelblue')
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .append('text')
      .attr('x', width / 2)
      .attr('y', margin.bottom - 5)
      .attr('fill', '#000')
      .text(xAxisColumn)
      .style('font-size', '14px');

    svg
      .append('g')
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .attr('fill', '#000')
      .text(yAxisColumn)
      .style('font-size', '14px');

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
      d3.select(this).attr('r', 6).attr('fill', 'red');

      tooltip
        .html(
          `<strong>${xAxisColumn}:</strong> ${d[xAxisColumn]}<br/><strong>${yAxisColumn}:</strong> ${d[yAxisColumn]}`
        )
        .style('top', event.pageY - 10 + 'px')
        .style('left', event.pageX + 10 + 'px')
        .style('visibility', 'visible');
    }

    function handleMouseOut(_, d) {
      d3.select(this).attr('r', 4).attr('fill', 'steelblue');

      // Hide tooltip
      tooltip.style('visibility', 'hidden');
    }
  };

  return <svg ref={chartRef}></svg>;
};

export default LineChart;
