import React, { useEffect, useState } from 'react';
import './App.css';
import Highcharts, { SeriesLineOptions } from 'highcharts';

function App() {
  //useStateでoptionを定義
  const [selectedOption, setSelectedOption] = useState("Overlay");


  //useEffectでoptionが変更されるとHighChartsにて再描画
  useEffect(() => {
    let selectedSeriesData: Highcharts.SeriesLineOptions[] = []; // ここで型を定義します。

    if (selectedOption === 'Overlay') {
      selectedSeriesData = [{
        type: 'line',
        name: '広告枠A',
        data: [75, 82, 80, 76, 72, 70, 74, 79, 77, 81, 73, 75]
      },
      {
        type: 'line',
        name: '広告枠B',
        data: [65, 68, 74, 71, 73, 66, 80, 71, 69, 75, 71, 77]
      }];
    } else if (selectedOption === 'Interstitial') {
      selectedSeriesData = [{
        type: 'line',
        name: '広告枠C',
        data: [92, 79, 101, 89, 90, 92, 88, 81, 67, 74, 69, 89]
      },
      {
        type: 'line',
        name: '広告枠D',
        data: [78, 90, 78, 78, 84, 86, 89, 90, 87, 67, 77, 88]
      }];
    } else if (selectedOption === 'Inarticle') {
      selectedSeriesData = [{
        type: 'line',
        name: '広告枠E',
        data: [76, 67, 89, 90, 101, 110, 99, 97, 100, 104, 100, 102]
      },
      {
        type: 'line',
        name: '広告枠F',
        data: [88, 89, 99, 78, 100, 100, 75, 88, 81, 78, 79, 90]
      }];
    }

    const chart = new Highcharts.Chart({
      chart: {
        renderTo: 'container',
        margin: [50, 150, 60, 80]
      },
      title: {
        text: '平均CPM',
        style: { margin: '50px 100px 0 0' }
      },
      xAxis: {
        categories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        title: { text: '月' }
      },
      yAxis: {
        title: { text: 'CPM (¥)' },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      tooltip: {
        formatter: function (this: any) {
          return this.series.name + ' ' + this.x + ': ¥' + this.y;
        }
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -10,
        y: 100,
        borderWidth: 0
      },
      series: selectedSeriesData
    });
  }, [selectedOption]);

  // selectエレメントが変更されたときにselectedOptionを更新
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
    console.log(`${event.target.value} was selected.`)
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