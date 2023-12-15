import React, { useState } from 'react';
import Chart from './Chart';
import FileUploader from './FileUploader';
import Papa from 'papaparse'; 

function App() {
  const [uploadedData, setUploadedData] = useState([]);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target.result;
      Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          setUploadedData(results.data);
        },
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Data Visualization</h1>
      </header>
      <main>
        <FileUploader onFileUpload={handleFileUpload} />
        <Chart data={uploadedData} />
      </main>
    </div>
  );
}

export default App;