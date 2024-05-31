let web3;
let accounts;

// Connect to MetaMask
const connectButton = document.getElementById('connect-button');
const connectStatus = document.getElementById('connect-status');

connectButton.addEventListener('click', async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
      accounts = await web3.eth.getAccounts();
      connectStatus.classList.remove('disconnected');
      connectStatus.classList.add('connected');
    } catch (error) {
      console.error('User denied account access');
    }
  } else {
    console.error('MetaMask is not installed');
  }
});

// Search for ENS domain
const ensInput = document.getElementById('ens-input');
const searchButton = document.getElementById('search-button');
const resultDiv = document.getElementById('result');
const signButton = document.getElementById('sign-button');
const signatureDiv = document.getElementById('signature');

searchButton.addEventListener('click', async () => {
    const ensDomain = ensInput.value;
    if (web3 && ensDomain) {
      try {
        const address = await web3.eth.ens.getAddress(ensDomain);
        resultDiv.textContent = `The address for ${ensDomain} is ${address}`;
        signButton.disabled = false;
      } catch (error) {
        const resolverAddressRegex = /The resolver at (0x[0-9a-fA-F]{40})does not implement requested method/;
        const match = error.message.match(resolverAddressRegex);
        if (match && match[1] !== '0x0000000000000000000000000000000000000000') {
          resultDiv.textContent = `The address for ${ensDomain} is ${match[1]}`;
          signButton.disabled = false;
        } else {
          resultDiv.textContent = `Error: ${error.message}`;
          signButton.disabled = true;
        }
      }
    } else {
      resultDiv.textContent = 'Please connect to MetaMask and enter an ENS domain';
      signButton.disabled = true;
    }
  });

signButton.addEventListener('click', async () => {
  const ensDomain = ensInput.value;
  try {
    const signature = await web3.eth.personal.sign(ensDomain, accounts[0]);
    signatureDiv.textContent = `Signature: ${signature}`;
  } catch (error) {
    signatureDiv.textContent = `Error: ${error.message}`;
  }
});