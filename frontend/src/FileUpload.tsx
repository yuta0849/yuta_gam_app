import React from 'react';

type FileUploadProps = {
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    inputFileRef: React.RefObject<HTMLInputElement>;
    uploadedFile: boolean;
    uploadButtonClick: () => void;
    isInputVisible: boolean;
    inputName: string;
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isSaveButtonVisible: boolean;
    handleSaveUploadData: () => Promise<void>;
    message: string;
  }
  
  const FileUpload = ({
    handleFileUpload,
    inputFileRef,
    uploadedFile,
    uploadButtonClick,
    isInputVisible,
    inputName,
    handleInputChange,
    isSaveButtonVisible,
    handleSaveUploadData,
    message,
  }: FileUploadProps) => {
    return (
      <>
        <input type="file" onChange={handleFileUpload} ref={inputFileRef}/>
        {uploadedFile && <button onClick={uploadButtonClick}>アップロードデータを保存</button>}
        {isInputVisible && (<input type="text" value={inputName} onChange={handleInputChange} placeholder="保存名を入力してください" />)}
        {isSaveButtonVisible && <button onClick={handleSaveUploadData}>保存</button>}
        {message && (<p style={{ color: message.startsWith('エラー') || message === 'Unkown Error' ? 'red' : 'initial' }}>{message}</p>)}
      </>
    );
  }

export default FileUpload;