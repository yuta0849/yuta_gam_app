import React, { useEffect, useState } from 'react';
import './App.css';
import Highcharts, { SeriesLineOptions } from 'highcharts';
import axios from 'axios';

function App() {
  //useStateでoptionを定義
  const [selectedOption, setSelectedOption] = useState("Overlay");


  //useEffectでoptionが変更されるとHighChartsにて再描画
  useEffect(() => {
    console.log(`${selectedOption} was selected.`)
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/${selectedOption.toLowerCase()}`);
        
        //JSONデータをHighchartsに適した形式に変換します
        const formattedData = response.data.map((item: { avg_cpm: string, date: string }) => {
          return {
            x: new Date(item.date), // 日付
            y: Number(item.avg_cpm) // CPM値
          }
        });
  
        var chart = new Highcharts.Chart({
          chart: {
            renderTo: 'container',
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
            name: selectedOption, //選択されたオプション（＝チャート名）
            data: formattedData  //変換後のデータ
          }]
        });
        
      } catch (error) {
        console.error(`Error fetching data: ${error}`);
      }
    }
  
    fetchData();
  }, [selectedOption]); //selectedOptionが変わる度にuseEffectが発火します。

  // select要素が変更されたときにselectedOptionを更新　→ selectedOptionが変更されるとuseEffectでAPIリクエストが行われhighCharts描画が行われる
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
};

  return (
    <>
      <div className="App" id="container">
      </div>
      <div className="center">
        <select value={selectedOption} onChange={handleChange}>
          <option value="Overlay">Overlay</option>
          <option value="Interstitial">Interstitial</option>
          <option value="Inarticle">Inarticle</option>
        </select>
      </div>
    </>
  );
}

export default App;