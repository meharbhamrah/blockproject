import { ethers } from "./ethers-5.2.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const withdrawButton = document.getElementById("withdrawButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton"); 
connectButton.onclick = connect;
withdrawButton.onclick = withdraw;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        const shortAddress =
          accounts[0].slice(0, 6) + "..." + accounts[0].slice(-4);
        connectButton.innerHTML = `Connected: ${shortAddress}`;
        console.log(accounts);
      } else {
        connectButton.innerHTML = "No accounts found";
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    connectButton.innerHTML = "Please install MetaMask";
  }
}

async function withdraw() {
  console.log(`Withdrawing...`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      document.getElementById("withdrawStatus").innerText =
        "Transaction Successfull";
      // await transactionResponse.wait(1)
      const amount = await contract.withdraw.call();

      const transactionRow = document.createElement("tr");
      transactionRow.innerHTML = `
  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Withdrawn</td>
  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ethAmount}</td>
  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${transactionResponse.hash}</td>
`;
      document
        .getElementById("transactionTable")
        .querySelector("tbody")
        .appendChild(transactionRow);
    } catch (error) {
      console.log(error);
      document.getElementById("withdrawStatus").innerText =
        "Transaction Failed";
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask";
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding with ${ethAmount}...`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
      document.getElementById("fundStatus").innerText = "Successfully Funded";

      const transactionRow = document.createElement("tr");
      transactionRow.innerHTML = `
  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Funded</td>
  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ethAmount}</td>
  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${transactionResponse.hash}</td>
`;
      document
        .getElementById("transactionTable")
        .querySelector("tbody")
        .appendChild(transactionRow);
    } catch (error) {
      console.log(error);
      document.getElementById("fundStatus").innerText = "Funding Failed";
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask";
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const balance = await provider.getBalance(contractAddress);
      console.log(ethers.utils.formatEther(balance));
      document.getElementById(
        "balanceDisplay"
      ).innerText = `Balance: ${ethers.utils.formatEther(balance)} ETH`;
    } catch (error) {
      console.log(error);
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask";
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    try {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations. `
        );
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
