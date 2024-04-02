import React from 'react';

type UserInfoProps = {
    username: string;
    handleLogout: () => Promise<void>;
  }
  
  const UserInfo = ({ username, handleLogout }: UserInfoProps) => {
    return (
      <>
        <h3>{username} さん</h3>
        <button onClick={handleLogout}>ログアウト</button>
      </>
    );
  }

  export default UserInfo;