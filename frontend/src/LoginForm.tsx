import React from 'react';

type LoginFormProps = {
    handleLogin: () => void;
  }
  
  const LoginForm = ({ handleLogin }: LoginFormProps) => {
    return (
      <div className="login-container">
        <button className="login-button" onClick={handleLogin}>ログイン</button>
      </div>
    );
  }

export default LoginForm;