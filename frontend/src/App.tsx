import React, { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import axios from 'axios';
import './App.css';
import { AxiosError } from "axios";
import LoginForm from './LoginForm';
import FileUpload from './FileUpload';
import UserInfo from './UserInfo';
import SavedData from './SavedData';
import SelectOption from './SelectOption';


function App() {
  const API_URL = process.env.REACT_APP_API_URL;

  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  const [selectedOption, setSelectedOption] = useState("Overlay");

  const containerRef = useRef(null);
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const [chart, setChart] = useState<Highcharts.Chart | null>(null);
  
  
  const [uploadedFile, setUploadedFile] = useState(false);
  const [uploadData, setUploadData] = useState(null);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [inputName, setInputName] = useState("");
  const [isSaveButtonVisible, setSaveButtonVisible] = useState(false);
  const [message, setMessage] = useState('');

  const [dataNames, setDataNames] = useState<string[]>([]);
  const [selectedSaveDataName, setSelectedSaveDataName] = useState("保存データを選択");
  const [fileGetErrorMessage, setFileGetErrorMessage] = useState("");
  const [deleteDataMessage, setDeleteDataMessage] = useState("");

  const clearFileInput = () => {
    if(inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  }

  // GoogleOAuth認証画面へリダイレクトする、/login エンドポイントへ遷移させる
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

  // ログイン時、画面初回描画時に走るuseEffect
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/loggedin`, { withCredentials: true });
        console.log(response.data);
        setLoggedIn(response.data.loggedIn);

        const userResponse = await axios.get(`${API_URL}/user`, { withCredentials: true });
        setUsername(userResponse.data.username);

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

  // overlay または interstitial の選択が変更した際に走るuseEffect
  useEffect(() => {
    clearFileInput();

    const fetchData = async () => {
      try {
        // エンドポイントにoverlayまたはinterstitialを含めてリクエスト
        const response = await axios.get(`${API_URL}/api/${selectedOption.toLowerCase()}`);

        const formattedData = response.data.map((item: { avg_cpm: string, date: string }) => {
          return {
            x: new Date(item.date),
            y: Number(item.avg_cpm)
          }
        });

        // containerRef.current が存在しているかチェックしてからチャートを描画
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
              floating: true,
              y: 10
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

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

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

    // レスポンスはJSON配列
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

  const handleUploadButtonClick = () => {
    // true時に保存名を入力するinput要素が表示される
    setIsInputVisible(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputName(event.target.value);
    if (event.target.value !== "") {
      // true時に保存ボタンを表示させる
      setSaveButtonVisible(true);
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
          if (error.response) {
            console.log('Error:', error.response.data);
            setMessage(`エラー: ${error.response.data.error}`);
          } else {
            console.log('Error:', error.message);
            setMessage('Unkown Error');
          }
        });

      if (response && response.status === 200) {
        clearFileInput();
        setUploadedFile(false);
        setMessage('データが保存されました');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    }
    setInputName('');
    setSaveButtonVisible(false);
  };

  useEffect(() => {
    if (!uploadedFile) {
      setIsInputVisible(false);
      setSaveButtonVisible(false);
    }
  }, [uploadedFile]);


  const handleSaveDataNameChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    setSelectedSaveDataName(selected);

    // 初期値の状態ではエンドポイントへのリクエストを行わない
    if (selected === '保存データを選択') {
      return;
    }

    const response = await axios.get(`${API_URL}/get-data-details?name=${selected}`, { withCredentials: true })
      .catch((error) => {
        if (error.response) {
          setFileGetErrorMessage(error.response.data.error);
        } else {
          setFileGetErrorMessage('データを取得中にエラーが発生しました。');
        }
      });

    if (response) {

      if (Array.isArray(response.data)) {
        const data = response.data.map((item: { date: string, ad_unit: string, avg_adx_cpm: string }) => {
          return {
            x: new Date(item.date).getTime(),
            y: parseFloat(item.avg_adx_cpm)
          };
        });

        if (chart) {
          // 描画前に、id:'uploaded'のseriesを削除、画面にはトレンドデータと任意のユニットのデータの2種のみが表示されるようにする
          const uploadedSeries = chart.get('uploaded');
          if (uploadedSeries) {
            uploadedSeries.remove();
          }

          chart.addSeries({
            type: 'line',
            id: 'uploaded',
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
    if (selectedSaveDataName === '保存データを選択') {
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/delete-saved-data?name=${selectedSaveDataName}`, { withCredentials: true });
      setDeleteDataMessage(response.data);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        setDeleteDataMessage(`エラー： ${String(axiosError.response.data)}`);
      } else {
        setDeleteDataMessage('エラー：データの削除中にエラーが発生しました。');
      }
    }
  };

  return (
    loggedIn
      ? <>
          <div className="App" id="container" ref={containerRef}></div>
          <div className="center">
            <div className="left-side">
              <SelectOption 
                selectedOption={selectedOption} 
                handleChange={handleChange} 
              />
              <FileUpload 
                inputFileRef={inputFileRef}
                handleFileUpload={handleFileUpload}
                uploadedFile={uploadedFile}
                uploadButtonClick={handleUploadButtonClick}
                isInputVisible={isInputVisible}
                inputName={inputName}
                handleInputChange={handleInputChange}
                isSaveButtonVisible={isSaveButtonVisible}
                handleSaveUploadData={handleSaveUploadData}
                message={message} 
              />
              <UserInfo 
                username={username} 
                handleLogout={handleLogout} 
              />
            </div>
            <div className="right-side">
              <SavedData 
                dataNames={dataNames}
                selectedSaveDataName={selectedSaveDataName}
                handleSaveDataNameChange={handleSaveDataNameChange}
                fileGetErrorMessage={fileGetErrorMessage}
                handleDeleteSaveData={handleDeleteSaveData}
                deleteDataMessage={deleteDataMessage}
              />
            </div>
          </div>
        </>
      : <LoginForm handleLogin={handleLogin} />
  );
}

export default App;