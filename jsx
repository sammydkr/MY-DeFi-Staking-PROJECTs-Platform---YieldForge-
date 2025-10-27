// frontend/src/components/StakingDashboard.js
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { stakingContractABI, tokenABI } from '../contracts/abis';

const StakingDashboard = () => {
  const [account, setAccount] = useState('');
  const [stakingBalance, setStakingBalance] = useState('0');
  const [rewardBalance, setRewardBalance] = useState('0');
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const STAKING_CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
  const STAKING_TOKEN_ADDRESS = "YOUR_STAKING_TOKEN_ADDRESS";

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        loadBalances(accounts[0]);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        setAccount(address);
        setIsConnected(true);
        loadBalances(address);
      } catch (error) {
        console.error("User rejected connection:", error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const loadBalances = async (address) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingContractABI, provider);
    
    const balance = await stakingContract.balances(address);
    const earned = await stakingContract.earned(address);
    
    setStakingBalance(ethers.utils.formatEther(balance));
    setRewardBalance(ethers.utils.formatEther(earned));
  };

  const stakeTokens = async () => {
    if (!stakeAmount || stakeAmount <= 0) return;
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingContractABI, signer);
    const tokenContract = new ethers.Contract(STAKING_TOKEN_ADDRESS, tokenABI, signer);
    
    try {
      // Approve tokens first
      const approveTx = await tokenContract.approve(
        STAKING_CONTRACT_ADDRESS, 
        ethers.utils.parseEther(stakeAmount)
      );
      await approveTx.wait();
      
      // Stake tokens
      const stakeTx = await stakingContract.stake(ethers.utils.parseEther(stakeAmount));
      await stakeTx.wait();
      
      await loadBalances(account);
      setStakeAmount('');
      alert('Successfully staked tokens!');
    } catch (error) {
      console.error('Staking error:', error);
      alert('Staking failed!');
    }
  };

  const claimRewards = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, stakingContractABI, signer);
    
    try {
      const tx = await stakingContract.getReward();
      await tx.wait();
      await loadBalances(account);
      alert('Rewards claimed successfully!');
    } catch (error) {
      console.error('Claim error:', error);
      alert('Claim failed!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">🚀 YieldForge Staking</h1>
          <p className="text-xl opacity-90">Stake your tokens and earn rewards</p>
        </header>

        {!isConnected ? (
          <div className="text-center">
            <button 
              onClick={connectWallet}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg text-lg transition duration-300"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-white bg-opacity-5 rounded-xl">
                  <h3 className="text-lg mb-2">💰 Staked Balance</h3>
                  <p className="text-2xl font-bold">{stakingBalance} STK</p>
                </div>
                <div className="text-center p-6 bg-white bg-opacity-5 rounded-xl">
                  <h3 className="text-lg mb-2">🎯 Pending Rewards</h3>
                  <p className="text-2xl font-bold">{rewardBalance} RWD</p>
                </div>
                <div className="text-center p-6 bg-white bg-opacity-5 rounded-xl">
                  <h3 className="text-lg mb-2">👤 Account</h3>
                  <p className="text-sm font-mono truncate">{account}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stake Section */}
                <div className="bg-black bg-opacity-30 p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-4">Stake Tokens</h3>
                  <div className="space-y-4">
                    <input
                      type="number"
                      placeholder="Amount to stake"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="w-full p-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-white"
                    />
                    <button
                      onClick={stakeTokens}
                      className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-lg font-bold transition duration-300"
                    >
                      Stake Tokens
                    </button>
                  </div>
                </div>

                {/* Rewards Section */}
                <div className="bg-black bg-opacity-30 p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-4">Claim Rewards</h3>
                  <div className="space-y-4">
                    <button
                      onClick={claimRewards}
                      disabled={parseFloat(rewardBalance) === 0}
                      className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 py-3 rounded-lg font-bold transition duration-300"
                    >
                      Claim {rewardBalance} RWD
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StakingDashboard;
