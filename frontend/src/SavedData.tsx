import React from 'react';

type SavedDataProps = {
    dataNames: string[];
    selectedSaveDataName: string;
    handleSaveDataNameChange: (event: React.ChangeEvent<HTMLSelectElement>) => Promise<void>;
    fileGetErrorMessage: string;
    handleDeleteSaveData: () => Promise<void>;
    deleteDataMessage: string;
  }
  
  const SavedData = ({
    dataNames,
    selectedSaveDataName,
    handleSaveDataNameChange,
    fileGetErrorMessage,
    handleDeleteSaveData,
    deleteDataMessage,
  }: SavedDataProps) => {
    return (
      <>
        <select value={selectedSaveDataName} onChange={handleSaveDataNameChange}>
          {dataNames.map((name, index) => (
            <option key={index} value={name}>{name}</option>
          ))}
        </select>
        {fileGetErrorMessage && <div className="error-message" style={{ color: 'red' }}>{fileGetErrorMessage}</div>}
        <button onClick={handleDeleteSaveData}>保存データを削除する</button>
        {deleteDataMessage &&  (<p style={{ color: deleteDataMessage.startsWith('エラー') ? 'red' : 'initial' }}>{deleteDataMessage}</p>)}
      </>
    );
  }

export default SavedData;