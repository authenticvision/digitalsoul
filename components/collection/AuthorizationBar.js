import React, { useState, useEffect } from 'react';
import UserCircleIcon from '@heroicons/react/24/outline/UserCircleIcon'
import Wallet from './Wallet'

const AuthorizationBar = ({ wallet, handleWalletChange, ... props }) => {
  const [error, setError] = useState(null);

  return (
    <div className="flex items-center justify-between w-full">
      <div>&nbsp;</div>
      <div className="flex items-center">
        <UserCircleIcon width="24px" />
        <Wallet wallet={wallet} handleWalletChange={handleWalletChange} />
      </div>
    </div>
  );
};

export default AuthorizationBar;
