
import React, { useEffect, useState, useRef } from 'react';
import _debounce from 'lodash/debounce';
import ScatterPlot from './ScatterPlot';
import { FixedSizeList as List } from 'react-window';
import Histogram from './Histogram';
import * as d3 from 'd3';
import './Chart.css';

const Chart = ({ data }) => {
  const [xAxisColumn, setXAxisColumn] = useState('');
  const [yAxisColumn, setYAxisColumn] = useState('');
  const [samplingMethod, setSamplingMethod] = useState('random');
  const [chartType, setChartType] = useState('scatter');
  const [showAll, setShowAll] = useState(false);
  const [combinations, setCombinations] = useState([]);
  const chartRef = useRef();

  const handleShowAll = () => {
    const randomCombinations = generateRandomCombinations().slice(0, 10);
    setCombinations(randomCombinations);
    setShowAll(true);
  };

  const handleShowSingle = () => {
    setCombinations([]); // Clear the combinations
    setShowAll(false);
  };

  useEffect(() => {
    // Set default values for xAxisColumn and yAxisColumn only if data is available
    if (data && data.length > 0) {
      const numericColumns = getNumericColumns(data[0]);
      setXAxisColumn(numericColumns[0]);
      setYAxisColumn(numericColumns[1]);
    }
  }, [data]);

  const getCombinations = (arr, k) => {
    const result = [];

    const helper = (current, start) => {
      if (current.length === k) {
        result.push([...current]);
        return;
      }

      for (let i = start; i < arr.length; i++) {
        current.push(arr[i]);
        helper(current, i + 1);
        current.pop();
      }
    };

    helper([], 0);
    return result;
  };

  const handleShowAllDebounced = _debounce(handleShowAll, 300);

  const renderSingleChart = () => {
    return (
      <div className="chart-container">
        {chartType === 'scatter' && (
          <ScatterPlot
            data={data}
            xAxisColumn={xAxisColumn}
            yAxisColumn={yAxisColumn}
            samplingMethod={samplingMethod}
          />
        )}

        {chartType === 'histogram' && (
          <Histogram
            data={data}
            xAxisColumn={xAxisColumn}
            yAxisColumn={yAxisColumn}
            samplingMethod={samplingMethod}
          />
        )}
      </div>
    );
  };



  const renderAllCombinations = () => {
    return (
      <div className="small-chart-box">
        {combinations.map((combination, index) => (
          <div key={index} className="small-chart">
            {chartType === 'scatter' && (
              <ScatterPlot
                data={data}
                xAxisColumn={combination.x}
                yAxisColumn={combination.y}
                samplingMethod={samplingMethod}
              />
            )}
  
            {chartType === 'histogram' && (
              <Histogram
                data={data}
                xAxisColumn={combination.x}
                yAxisColumn={combination.y}
                samplingMethod={samplingMethod}
              />
            )}
          </div>
        ))}
      </div>
    );
  };
  
  

  const renderCharts = () => {
    switch (chartType) {
      case 'scatter':
        return showAll ? renderAllCombinations() : renderSingleChart();
      case 'histogram':
        return showAll ? renderAllCombinations() : renderSingleChart();
      default:
        return null; 
    }
  };

  const getNumericColumns = (rowData) => {
    if (!rowData) {
      return [];
    }
    return Object.keys(rowData).filter((column) => {
      return (
        !isNaN(parseFloat(rowData[column])) && 
        column.toLowerCase() !== 'year' 
      );
    });
  };

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  const handleShowAllChange = (event) => {
    setShowAll(event.target.checked);
  };

  const generateRandomCombinations = () => {
    const numericColumns = getNumericColumns(data[0]);
    const combinations = [];

    // Shuffle the numeric columns
    const shuffledColumns = [...numericColumns].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(10, numericColumns.length); i++) {
      for (let j = i + 1; j < Math.min(10, numericColumns.length); j++) {
        combinations.push({ x: shuffledColumns[i], y: shuffledColumns[j] });
      }
    }

    return combinations;
  };

  return (
    <div className="chart-container">
      <div className="axis-selector">
        <label>X-Axis:</label>
        <select value={xAxisColumn} onChange={(event) => setXAxisColumn(event.target.value)}>
          {getNumericColumns(data[0]).map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>
      </div>
      <div className="axis-selector">
        <label>Y-Axis:</label>
        <select value={yAxisColumn} onChange={(event) => setYAxisColumn(event.target.value)}>
          {getNumericColumns(data[0]).map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>
      </div>
      <div className="axis-selector">
        <label>Sampling Method:</label>
        <select value={samplingMethod} onChange={(event) => setSamplingMethod(event.target.value)}>
          <option value="random">Random Sampling</option>
          <option value="simple">Simple Random Sampling</option>
          <option value="cluster">Cluster Random Sampling</option>
          <option value="stratified">Stratified Sampling</option>
          <option value="stratifiedRandom">Stratified Random Sampling</option>
          <option value="systematic">Systematic Sampling</option>
        </select>
      </div>
      <div className="axis-selector">
        <label>Chart Type:</label>
        <select value={chartType} onChange={handleChartTypeChange}>
          <option value="scatter">Scatter Plot</option>
          <option value="histogram">Histogram</option>
        </select>
      </div>

      <button onClick={showAll ? handleShowSingle : handleShowAllDebounced}>
      {showAll ? 'Show Single' : 'Summary View'}
      </button>

      {renderCharts()}

    </div>
  );
};

export default Chart;