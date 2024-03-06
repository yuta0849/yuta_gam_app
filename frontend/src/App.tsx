import React, { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import axios from 'axios';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Overlay");
  const containerRef = useRef(null);
  const [chart, setChart] = useState<Highcharts.Chart | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/${selectedOption.toLowerCase()}`);

        const formattedData = response.data.map((item: { avg_cpm: string, date: string }) => {
          return {
            x: new Date(item.date),
            y: Number(item.avg_cpm)
          }
        });

        // containerRef.currentが存在しているかどうかチェック
        if (containerRef.current) {
          const newChart = new Highcharts.Chart({
            chart: {
              renderTo: containerRef.current,
              margin: [50, 150, 60, 80]
            },
            title: { text: undefined },
            xAxis: {
              type: 'datetime',
              title: { text: null }
            },
            yAxis: {
              title: { text: null },
              plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
              }]
            },
            tooltip: {
              pointFormat: 'CPM: ¥<b>{point.y:.2f}</b>',
              xDateFormat: '%m/%d'
            },
            legend: {
              layout: 'vertical',
              align: 'right',
              verticalAlign: 'top',
              x: -10,
              y: 100,
              borderWidth: 0
            },
            series: [{
              type: 'line',
              name: selectedOption,
              data: formattedData
            }]
          });
          setChart(newChart);
        }

      } catch (error) {
        console.error(`Error fetching data: ${error}`);
      }
    }

    fetchData();
  }, [selectedOption]);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/loggedin', { withCredentials: true });
        setLoggedIn(response.data.loggedIn);
      } catch (error) {
        console.error(`Error checking login status: ${error}`);
      }
    }

    checkLoginStatus();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

  const handleLogin = () => {
    window.location.href = "http://localhost:5000/login";
  }

  const handleLogout = async () => {
    if (chart !== null) {
      chart.destroy();
    }
    await axios.get('http://localhost:5000/logout', { withCredentials: true });
    setLoggedIn(false);
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) {
        return;
    }
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data instanceof Array) {
        const newSeriesData = response.data.map((item: {date: string, name: string, avg_cpm: number}) => {
            return {
                name: item.name,
                data: [{
                    x: new Date(item.date).getTime(),
                    y: item.avg_cpm
                }]
            };
        });
    
        if (chart) {
            newSeriesData.forEach((item) => {
                chart.addSeries({
                    type: 'line',
                    name: item.name,
                    data: item.data,
                });
            });
        }
    }
};

  if (!loggedIn) {
    return (
      <div className="center">
        <button onClick={handleLogin}>ログイン</button>
      </div>
    );
  }

  return (
    <>
      <div className="App" id="container" ref={containerRef}></div>
      <div className="center">
        <select value={selectedOption} onChange={handleChange}>
          <option value="Overlay">Overlay</option>
          <option value="Interstitial">Interstitial</option>
        </select>
        <input type="file" onChange={handleFileUpload} />
        <button onClick={handleLogout}>ログアウト</button>
      </div>
    </>
  );
}

export default App;