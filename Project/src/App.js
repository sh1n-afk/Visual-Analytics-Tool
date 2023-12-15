// App.js
/*
import React from 'react';
import FootballChart from './FootballChart';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Football Data Visualization</h1>
      </header>
      <main>
        <FootballChart />
      </main>
    </div>
  );
}

export default App;
*/

// App.js
import React, { useState } from 'react';
import FootballChart from './FootballChart';
import FileUploader from './FileUploader';
import Papa from 'papaparse'; // Import papaparse

function App() {
  const [uploadedData, setUploadedData] = useState([]);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target.result;
      // Use papaparse to convert CSV to JSON
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
        <FootballChart data={uploadedData} />
      </main>
    </div>
  );
}

export default App;