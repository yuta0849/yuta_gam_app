import React, { useEffect, useState } from 'react';
import './App.css';
import Highcharts from 'highcharts';

function App() {
  const [selectedOption, setSelectedOption] = useState("default");
  useEffect(() => {
    //highchartsにて描画
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
      series: [{
        type: 'line', // 追加
        name: '広告枠A',
        data: [75, 82, 80, 76, 72, 70, 74, 79, 77, 81, 73, 75]
      },
      {
        type: 'line', // 追加
        name: '広告枠B',
        data: [65, 68, 74, 71, 73, 66, 80, 71, 69, 75, 71, 77]
      }]
    });
  }, [selectedOption]);

  // selectエレメントが変更されたときにselectedOptionを更新
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
};

  return (
    <>
      <div className="App" id="container">
      </div>
      <div className="center">
        <select value={selectedOption} onChange={handleChange}>
          <option value="option1">Overlay</option>
          <option value="option2">Interstitial</option>
          <option value="option3">Inarticle</option>
        </select>
      </div>
    </>
  );
}

export default App;