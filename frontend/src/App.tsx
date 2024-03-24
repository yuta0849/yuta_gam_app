import React, { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import axios from 'axios';
import './App.css';
import { AxiosError } from "axios";

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
  // ユーザーが過去に保存したsave_data_nameをリスト型で保持するstate
  const [dataNames, setDataNames] = useState<string[]>([]);
  // save_data_nameを保持するState
  const [selectedSaveDataName, setSelectedSaveDataName] = useState("保存データを選択");
  // 保存データ呼び出し時のエラーメッセージを保持するState
  const [fileGetErrorMessage, setFileGetErrorMessage] = useState("");
  // 保存データ削除時のメッセージを保持するState
  const [deleteDataMessage, setDeleteDataMessage] = useState("");

  // ユーザーが選択したファイルのクリア
  const clearFileInput = () => {
    if(inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  }

  useEffect(() => {
    // input要素のリセット
    clearFileInput();

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
    setSelectedSaveDataName('保存データを選択');
  }, [selectedOption]);

  // 画面初回描画時に走るuseEffect
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // ログイン状態の確認
        const response = await axios.get(`${API_URL}/loggedin`, { withCredentials: true });
        console.log(response.data);
        setLoggedIn(response.data.loggedIn);

        // ユーザー名の取得
        const userResponse = await axios.get(`${API_URL}/user`, { withCredentials: true });
        setUsername(userResponse.data.username);

        // 保存データの取得
        const savedDataResponse = await axios.get(`${API_URL}/get-saved-data`, { withCredentials: true });
        const savedData = await savedDataResponse.data;
        if (savedData.length === 0) {
          setDataNames(['保存データを選択']);
        } else {
          setDataNames(['保存データを選択', ...savedData.map((data: { [key: string]: string }) => data.save_data_name)]);
        }
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
        if (uploadedSeries) {
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
    setSelectedSaveDataName('保存データを選択');
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
        clearFileInput();
        setUploadedFile(false);
        console.log('save成功');
        console.log(uploadObject);
        setMessage('データが保存されました');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
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

  // saveDataNameが変更された際に実行される関数(useEffectを使用していない)
  const handleSaveDataNameChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedSaveDataName(selected);

    // 初期値の状態ではエンドポイントへのリクエストを行わない
    if (selected === '保存データを選択') {
      return;
    }

    const response = await axios.get(`${API_URL}/get-data-details?name=${selected}`, { withCredentials: true })
      .catch((error) => {
        // サーバーから返されたエラーレスポンスを処理 
        if (error.response) {
          setFileGetErrorMessage(error.response.data.error);
        } else {
          setFileGetErrorMessage('データを取得中にエラーが発生しました。');
        }
      });

    if (response) {
      // レスポンスの確認
      console.log(response);

      if (Array.isArray(response.data)) {
        const data = response.data.map((item: { date: string, ad_unit: string, avg_adx_cpm: string }) => {
          return {
            x: new Date(item.date).getTime(),
            y: parseFloat(item.avg_adx_cpm)
          };
        });
        // マッピング後のdataを確認
        console.log(data);

        if (chart) {
          // id 'uploaded'のseriesを削除
          const uploadedSeries = chart.get('uploaded');
          if (uploadedSeries) {
            uploadedSeries.remove();
          }
          // chartの状態を確認
          console.log(chart);

          // 新しいseriesを追加
          chart.addSeries({
            type: 'line',
            id: 'uploaded',  // upload時に既に存在するuploadデータを削除するための識別id
            name: selected,
            data: data,
          });
        }
      }
    }
    clearFileInput();
    setUploadedFile(false);
  };

  const handleDeleteSaveData = async () => {
    // 初期値の状態ではエンドポイントへのリクエストを行わない
    if (selectedSaveDataName === '保存データを選択') {
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/delete-saved-data?name=${selectedSaveDataName}`, { withCredentials: true });
      setDeleteDataMessage(response.data);  // サーバからのメッセージを表示
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        setDeleteDataMessage(`エラー： ${String(axiosError.response.data)}`); // エラーメッセージを文字列化して表示
      } else {
        setDeleteDataMessage('エラー：データの削除中にエラーが発生しました。');
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
        {/* 後ほどLeftSideコンポーネントとして切り出したい */}
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
        {/* 後ほどRightSideコンポーネントとして切り出したい */}
        <div className="right-side">
          <select value={selectedSaveDataName} onChange={handleSaveDataNameChange}>
            {dataNames.map((name, index) => (
              <option key={index} value={name}>{name}</option>
            ))}
          </select>
          {fileGetErrorMessage && <div className="error-message" style={{ color: 'red' }}>{fileGetErrorMessage}</div>}
          <button onClick={handleDeleteSaveData}>保存データを削除する</button>
          {deleteDataMessage &&  (<p style={{ color: deleteDataMessage.startsWith('エラー') ? 'red' : 'initial' }}>{deleteDataMessage}</p>)}
        </div>
      </div>
    </>
  );
}

export default App;