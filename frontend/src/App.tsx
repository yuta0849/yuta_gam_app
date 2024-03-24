import React, { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import axios from 'axios';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Overlay");
  const containerRef = useRef(null);
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const [chart, setChart] = useState<Highcharts.Chart | null>(null);
  const API_URL = process.env.REACT_APP_API_URL;
  const [username, setUsername] = useState('');
  // アップロードされたファイルの有無を保持するstate
  const [uploadedFile, setUploadedFile] = useState(false);
  // アップロードされるHighCharts用に成形されたデータを一時的に保持するためのstate
  const [uploadData, setUploadData] = useState(null);
  // データ保存時、保存名を入力するinput要素の表示/非表示を保持するstate
  const [isInputVisible, setIsInputVisible] = useState(false);
  // ユーザーが入力するデータ名を保存するstate
  const [inputName, setInputName] = useState("");
  // 保存名を入力時、保存ボタンを表示するかどうかを保持するstate
  const [isSaveButtonVisible, setSaveButtonVisible] = useState(false);
  // 保存成功/失敗時に表示するメッセージ内容を保持
  const [message, setMessage] = useState('');

  useEffect(() => {
    // input要素のリセット
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/${selectedOption.toLowerCase()}`);

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
              margin: [50, 120, 100, 120]
            },
            title: { text: undefined },
            xAxis: {
              type: 'datetime',
              title: { text: 'Date' }
            },
            yAxis: {
              title: { text: 'CPM(¥)' },
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
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom',
              floating: true,  // 凡例を浮かせて表示
              y: 10  // 上方向に30pxスライド
            },
            series: [{
              type: 'line',
              id: 'default',
              name: `${selectedOption}-Trend`, 
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
    setUploadedFile(false);
    setMessage('');
  }, [selectedOption]);

  // 画面初回描画時に走るuseEffect
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // ログイン状態の確認
        const response = await axios.get(`${API_URL}/loggedin`, { withCredentials: true });
        // 下記がなぜか初回レンダリング時に2回呼び出されている(開発環境のみ？)
        console.log(response.data);
        setLoggedIn(response.data.loggedIn);

        // ユーザー名の取得
        const userResponse = await axios.get(`${API_URL}/user`, { withCredentials: true });
        setUsername(userResponse.data.username);
      } catch (error) {
        console.error(`Error checking login status: ${error}`);
      }
    }

    checkLoginStatus();
    setUploadedFile(false);
    setMessage('');
  }, []);


  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

  const handleLogin = () => {
    window.location.href = `${API_URL}/login`;
  }

  const handleLogout = async () => {
    if (chart !== null) {
      chart.destroy();
    }
    await axios.get(`${API_URL}/logout`, { withCredentials: true });
    setLoggedIn(false);
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) {
      return;
    }
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    console.log(response.data);

    if (response.data instanceof Array) {
      const data = response.data.map((item: { date: string, name: string, avg_cpm: number }) => {
        return {
          x: new Date(item.date).getTime(),
          y: item.avg_cpm
        };
      });

      if (chart) {

        // id'uploaded'のseriesを削除
        const uploadedSeries = chart.get('uploaded');
        if(uploadedSeries) {
          uploadedSeries.remove();
        }
      
        // 新しいseriesを追加
        chart.addSeries({
          type: 'line',
          id: 'uploaded',  // upload時に既に存在するuploadデータを削除するための識別id
          name: response.data[0].name,   
          data: data,
        });
      }
    }
    setUploadedFile(true);
    setUploadData(response.data);
  };

  // アップロードボタンクリック時のハンドラ－
  const handleUploadButtonClick = () => {
    setIsInputVisible(true);
  };

  // 名前入力が完了したら保存ボタンを表示させる関数
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputName(event.target.value);
    if (event.target.value !== "") { // Inputが空でない場合に限り
      setSaveButtonVisible(true);    // 保存ボタンを表示
    }
  };

  const handleSaveUploadData = async () => {
    if (uploadData) {
      const uploadObject = {
        dataName: inputName,
        data: uploadData
      }
      const response = await axios.post(`${API_URL}/saveuploaddata`, uploadObject, { withCredentials: true })
        .catch((error) => {
          // サーバーから返されたエラーレスポンスを処理 
          if (error.response) {
            console.log('Error:', error.response.data);
            setMessage(`エラー: ${error.response.data.error}`);
          } else {
            console.log('Error:', error.message);
            setMessage('Unkown Error');
          }
        });

      if (response && response.status === 200) {
        // データ保存成功時の処理
        setUploadedFile(false);
        console.log('save成功');
        console.log(uploadObject);
        setMessage('データが保存されました');
      }
    }
    setInputName('');  // 入力フィールドをクリア
    setSaveButtonVisible(false);  // 保存ボタンも非表示にする
  };

  // uploadedFileが変化したときに走るuseEffectフック
  useEffect(() => {
    if (!uploadedFile) {
      setIsInputVisible(false);
      setSaveButtonVisible(false);
    }
  }, [uploadedFile]);

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
        <div className="left-side">
          <select value={selectedOption} onChange={handleChange}>
            <option value="Overlay">Overlay</option>
            <option value="Interstitial">Interstitial</option>
          </select>
          <input type="file" ref={inputFileRef} onChange={handleFileUpload} />
          {uploadedFile && <button onClick={handleUploadButtonClick}>アップロードデータを保存</button>}
          {isInputVisible && (<input type="text" value={inputName} onChange={handleInputChange} placeholder="保存名を入力してください" />)}
          {isSaveButtonVisible && <button onClick={handleSaveUploadData}>保存</button>}
          {message && (<p style={{ color: message.startsWith('エラー') || message === 'Unkown Error' ? 'red' : 'initial' }}>{message}</p>)}
          <h3>{username} さん</h3>
          <button onClick={handleLogout}>ログアウト</button>
        </div>
        <div className="right-side">
          <select>
            <option value="保存データA">保存データA</option>
            <option value="保存データB">保存データB</option>
          </select>
          <button>保存データを削除する</button>
        </div>
      </div>
    </>
  );
}

export default App;