import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { ethers } from 'ethers';
import { useState, useEffect } from "react";
import { abi } from 'constants/abi' // abi

// const abi = require('C:/Users/user/Desktop/Full_Stack/Hardhat/artifacts/contracts/CoinFlip.sol/CoinFlip.json').abi;

const injected = new InjectedConnector();

export default function Home() {
  const { activate, active, library: provider } = useWeb3React();

  const [hasMetamask, setHasMetamask] = useState(false);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
  });




  async function connect() {
    if (typeof window.ethereum !== "undefined") {
      try {
        await activate(injected)
        setHasMetamask(true);
        console.log(active);
        console.log(abi);
        const accounts = await ethereum.request({ method: "eth_accounts" });
        document.getElementById("accountLabel").innerHTML = accounts;
        console.log(accounts); // 打印当前账户
      } catch (e) {
        console.log(e);
      }
    }


  }

  // hash = gethash(player1 bool, password uint256) // 得到player1哈希值
  // makeBet(hash) // player1发起赌约, 并设置赌约金 (msg.value)
  // takeBet(player2 bool) // player2接受 mag.value的赌约金, 并做出猜测正反
  // reveal(player1 bool, password uint256) 查看player2猜的对不对, 猜对player1转钱, 猜错player2转钱


  // Bet按钮: play1设置selection和password -> hash = gethash(selection,password) -> makeBet(hash, {value:'1111111111'})
  // Guess按钮: play2设置selection takeBet(selection, {value:'1111111111'})
  // Reveal按钮: reveal(player1 bool, play1 password uint256)

  // 问题: msg.value 怎么在前端设置
  // 问题: contract.player1() 调用不了
  // 问题: contract.gethash用不了

  // 查看是否为 player2 
  async function check() {
    console.log(active);
    if (active) {
      const signer = provider.getSigner();
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const contract = new ethers.Contract(contractAddress, abi, signer);

      try {
        p1 = await contract.player1();
        p2 = await contract.player2();
        if (p1 == "0x0000000000000000000000000000000000000000") {
          document.getElementById("resultLabel").innerHTML = "No bet";
        } else if (p2 == "0x0000000000000000000000000000000000000000") {
          value = await contract.bet();  // ?????????? 调用这个js的bet()函数吗
          document.getElementById("resultLabel").innerHTML = "Bet made, value:" + value;
        }
        else {
          document.getElementById("resultLabel").innerHTML = "Bet taken. Waiting for reveal.";
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      alert("Please Connect Metamask!")
    }
  }

  // 返回selction和passwrod
  async function collectValues() {
    var selection = document.getElementById("selectionInput").value;
    if (selection == "head") {
      selection = 1;
    } else {
      selection = 0;
    }
    var pass = document.getElementById("passwordInput").value;

    console.log('selection:', selection, 'password:', pass)

    return [selection, pass];
  }


  // p1 打赌
  async function bet() {
    if (active) {
      const signer = provider.getSigner();
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const vals = await collectValues();
        const selection = vals[0]; // p1的选择 (bool)
        const password = vals[1]; // 赌资 bet
        console.log(vals, password);
        //const hash = await ethers.utils.keccak256([selection,password]);
        //console.log(hash);
        
        //await contract.makeBet(hash, { value: ethers.utils.parseEther("1") }); // msg.value
        //await contract.makeBet(hash, { value: '10000000000000000' });
        await contract.makeBet('0x0000000000000000000000000000000000000000000000000000000000000000', { value: '10000000000000000' });
      } catch (e) {
        console.log(e);
      }
    } else {
      alert("Please Connect Metamask!");
    }
  }

  // p2 猜
  async function guess() {
    if (active) {
      const signer = provider.getSigner();
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const vals = await collectValues();
        const selection = vals[0];
        console.log(selection);
        // p2猜
        await contract.takeBet(selection, { value: '10000000000000000' });
      } catch (e) {
        console.log(e);
      }
    } else {
      alert("Please Connect Metamask!");
    }
  }

  // 查看 p2 是否猜对 没猜对就赚钱
  async function reveal() {
    if (active) {
      const signer = provider.getSigner();
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const vals = await collectValues();
        const selection = vals[0];
        const password = vals[1];
        console.log(vals);
        await contract.reveal(selection, password);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Please connect MetaMask");
    }

  }

  return (

    hasMetamask ?
      <main className='mx-auto h-screen overflow-auto bg-gray-100'>
        <div className='flex justify-center' >
          <div className='space-y-6 my-10 w-full px-8 py-12 bg-white rounded-2xl   shadow-md sm:w-full md:w-3/4 lg:w-2/3'>
            <h1 className="flex text-3xl font-bold justify-center">CoinFlip</h1>
            <div className='flex flex-row items-center space-x-2'>
              <div className='basis-1/6 font-bold'> Account </div>
              <div id="accountLabel" className='basis-2/3'> None </div>
              {active ?
                (<button className='btn btn-primary' onClick={() => connect()}>Connected</button>) :
                (<button className='btn btn-primary' onClick={() => connect()}>Connect</button>)
              }
            </div>

            <div className='flex flex-row items-center space-x-2'>
              <div className='basis-1/6 font-bold'> State </div>
              <div id="resultLabel" className='basis-2/3'> No Bet </div>
              <button id="reloadButton" className='basis-1/6 btn btn-primary' onClick={() => check()}>Reload</button>
            </div>

            <div className='flex flex-row items-center space-x-2'>
              <div className='basis-1/4 font-bold'> Selection </div>
              <select id="selectionInput" className='select-bordered select grow text-sm '>
                <option value="head">Head</option>
                <option value="tail">Tail</option>
              </select>
            </div>

            <div className='flex flex-row items-center space-x-2'>
              <div className='basis-1/4 font-bold'> Password </div>
              <input id="passwordInput" type="password" className='input-bordered input grow'></input>
            </div>

            <div className="flex flex-row  justify-center space-x-16">
              <button className="basis-1/4 btn btn-primary" onClick={() => bet()}>Bet</button>
              <button className="basis-1/4 btn btn-primary" onClick={() => guess()}>guess</button>
              <button className="basis-1/4 btn btn-primary" onClick={() => reveal()}>reveal</button>
            </div>
          </div>
        </div>
      </main>
      : "Please install MetaMask"





  )
}
