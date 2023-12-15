import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './Chart.css';

const Histogram = ({ data, xAxisColumn, yAxisColumn, samplingMethod }) => {
  const chartRef = useRef();
  const [numBins, setNumBins] = useState(20); 

  useEffect(() => {
    if (data.length > 0) {
      createHistogram();
    }
  }, [data, xAxisColumn, yAxisColumn, samplingMethod, numBins]);

  const handleNumBinsChange = (event) => {
    setNumBins(parseInt(event.target.value, 10));
  };

  const createHistogram = () => {
    d3.select(chartRef.current).selectAll('*').remove();

    let sampledData;

    switch (samplingMethod) {
      case 'random':
        sampledData = randomSampling(data, 0.5); 
        break;
      case 'simple':
        sampledData = simpleRandomSampling(data, 0.5); 
        break;
      case 'cluster':
        sampledData = clusterRandomSampling(data, 0.5); 
        break;
      case 'stratified':
        sampledData = stratifiedSampling(data, 'SomeStratificationColumn', 0.5); 
        break;
      case 'stratifiedRandom':
        sampledData = stratifiedRandomSampling(data, 'SomeStratificationColumn', 0.5); 
        break;
      case 'systematic':
        sampledData = systematicSampling(data, 5); 
        break;
      default:
        sampledData = data; 
        break;
    }

    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const screenWidth = window.innerWidth * 0.75;
    const screenHeight = window.innerHeight * 0.75;
    const width = screenWidth - margin.left - margin.right;
    const height = screenHeight - margin.top - margin.bottom;

      const xDomain = d3.extent(sampledData, (d) => parseFloat(d[xAxisColumn]));

      const xScale = d3
      .scaleLinear()
      .domain([0, xDomain[1]]) 
      .range([0, width]);
    const histogram = d3
      .histogram()
      .value((d) => parseFloat(d[xAxisColumn]))
      .domain(xScale.domain())
      .thresholds(xScale.ticks(numBins));

    const bins = histogram(sampledData);

    const maxFrequency = d3.max(bins, (bin) => bin.length);

    let buffer;
    if (maxFrequency < 99) {
      buffer = 5;
    } else if (maxFrequency < 999) {
      buffer = 100;
    } else if (maxFrequency < 2000){
      buffer = 300;
    } else {
      buffer = 799
    }

    const yScale = d3
      .scaleLinear()
      .domain([0, maxFrequency + buffer])
      .range([height, 0]);

    const svg = d3
      .select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    svg
      .selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.x0))
      .attr('y', (d) => yScale(d.length))
      .attr('width', (d) => xScale(d.x1) - xScale(d.x0))
      .attr('height', (d) => height - yScale(d.length))
      .attr('fill', 'rgba(75, 192, 192, 0.7)')
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

    function handleMouseOver(event, bin) {
      d3.select(this).attr('fill', 'rgba(75, 192, 192, 1)');

      tooltip
        .html(`<strong>${xAxisColumn}:</strong> ${bin.x0.toFixed(2)} - ${bin.x1.toFixed(2)}<br/><strong>Frequency:</strong> ${bin.length}`)
        .style('top', event.pageY - 10 + 'px')
        .style('left', event.pageX + 10 + 'px')
        .style('visibility', 'visible');
    }

    function handleMouseOut(_, bin) {
      d3.select(this).attr('fill', 'rgba(75, 192, 192, 0.7)');

      tooltip.style('visibility', 'hidden');
    }
  };

  const randomSampling = (data, rate) => {
    return data.filter(() => Math.random() < rate);
  };

  const stratifiedSampling = (data, stratificationColumn, rate) => {
    const uniqueStrata = Array.from(new Set(data.map((d) => d[stratificationColumn])));
    const sampledData = [];

    uniqueStrata.forEach((stratum) => {
      const stratumData = data.filter((d) => d[stratificationColumn] === stratum);
      const stratumSample = simpleRandomSampling(stratumData, rate);
      sampledData.push(...stratumSample);
    });

    return sampledData;
  };

  const stratifiedRandomSampling = (data, stratificationColumn, rate) => {
    const uniqueStrata = Array.from(new Set(data.map((d) => d[stratificationColumn])));
    const sampledData = [];

    uniqueStrata.forEach((stratum) => {
      const stratumData = data.filter((d) => d[stratificationColumn] === stratum);
      const stratumSample = randomSampling(stratumData, rate);
      sampledData.push(...stratumSample);
    });

    return sampledData;
  };

  const systematicSampling = (data, interval) => {
    const sampledData = [];
    const dataSize = data.length;

    for (let i = 0; i < dataSize; i += interval) {
      sampledData.push(data[i]);
    }

    return sampledData;
  };

  const simpleRandomSampling = (data, rate) => {
    const sampledIndexes = new Set();
    const dataSize = data.length;
    const sampledSize = Math.ceil(dataSize * rate);

    while (sampledIndexes.size < sampledSize) {
      const randomIndex = Math.floor(Math.random() * dataSize);
      sampledIndexes.add(randomIndex);
    }

    return Array.from(sampledIndexes).map((index) => data[index]);
  };

  const clusterRandomSampling = (data, rate) => {
    const totalClusters = Math.ceil(data.length * rate);
    const clusterSize = Math.floor(data.length / totalClusters);

    const sampledData = [];
    for (let i = 0; i < totalClusters; i++) {
      const start = i * clusterSize;
      const end = (i + 1) * clusterSize;
      sampledData.push(...data.slice(start, end));
    }

    return sampledData;
  };

  return (
    <div>
      <label>Number of Bins:</label>
      <input
        type="number"
        value={numBins}
        onChange={handleNumBinsChange}
        min="1"
        max="100"
      />
      <svg ref={chartRef}></svg>
    </div>
  );
};

export default Histogram;
