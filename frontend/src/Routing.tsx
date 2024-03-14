import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SwaggerComponent from './SwaggerComponent';  // SwaggerComponentのインポート
import App from './App';

const Routing = () => {
  return (
    <Router>
      <Routes>
        <Route path="/swagger" element={<SwaggerComponent />}/>
        <Route path="/" element={<App />} />
      </Routes>
    </Router>
  );
};

export default Routing;