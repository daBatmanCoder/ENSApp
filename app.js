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
const passwordInput = document.getElementById('password-input');
const verifyButton = document.getElementById('verify-button');
const verifyResultDiv = document.getElementById('verify-result');

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
    verifyButton.disabled = false;
  } catch (error) {
    signatureDiv.textContent = `Error: ${error.message}`;
    verifyButton.disabled = true;
  }
});

verifyButton.addEventListener('click', async () => {
    const ensDomain = ensInput.value;
    const signature = signatureDiv.textContent.replace('Signature: ', '');
    const password = passwordInput.value;
  
    const requestData = {
      ens_message: ensDomain,
      signature: signature,
      password: password
    };

    console.log(requestData);  
  
    try {
      const response = await fetch('https://us-central1-arnacon-nl.cloudfunctions.net/verifyENS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
  
      const responseData = await response.text();
      verifyResultDiv.textContent = responseData
    } catch (error) {
      verifyResultDiv.textContent = `Error: ${error.message}`;
    }
  });