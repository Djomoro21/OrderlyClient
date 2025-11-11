/**
 * Browser Console Example: Manual EIP-712 Signature for Delegate Signer
 * 
 * Paste this into your browser console (with MetaMask or another wallet)
 * Make sure you're connected to the correct network
 * 
 * Step 1: Open browser console (F12)
 * Step 2: Connect wallet to the correct network
 * Step 3: Paste and run this script
 */

// ===== CONFIGURATION - UPDATE THESE VALUES =====
const config = {
  chainId: 80094, // e.g., 80094 for Berachain
  brokerId: 'your_broker_id',
  delegateContract: '0x0000000000000000000000000000000000000000',
  txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  registrationNonce: 0, // Get from API: GET /v1/registration_nonce
  timestamp: Date.now()
};

// ===== EIP-712 DOMAIN =====
const domain = {
  name: 'Orderly',
  version: '1',
  chainId: config.chainId,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
};

// ===== EIP-712 TYPES =====
const types = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' }
  ],
  DelegateSigner: [
    { name: 'delegateContract', type: 'address' },
    { name: 'brokerId', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'registrationNonce', type: 'uint256' },
    { name: 'txHash', type: 'bytes32' }
  ]
};

// ===== MESSAGE =====
const message = {
  delegateContract: config.delegateContract,
  brokerId: config.brokerId,
  chainId: config.chainId,
  timestamp: config.timestamp,
  registrationNonce: config.registrationNonce,
  txHash: config.txHash
};

// ===== SIGN WITH METAMASK =====
async function signWithMetaMask() {
  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    // Get the connected account
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const userAddress = accounts[0];
    
    console.log('Connected Address:', userAddress);
    console.log('Domain:', domain);
    console.log('Message:', message);

    // Request signature from MetaMask
    const signature = await window.ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [userAddress, JSON.stringify({
        domain,
        primaryType: 'DelegateSigner',
        types,
        message
      })]
    });

    console.log('\n=== Signature ===');
    console.log(signature);

    // Prepare API payload
    const apiPayload = {
      message: message,
      signature: signature,
      userAddress: userAddress
    };

    console.log('\n=== API Payload ===');
    console.log(JSON.stringify(apiPayload, null, 2));

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(apiPayload, null, 2))
      .then(() => console.log('\n✅ Payload copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));

    return { signature, message, userAddress };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// ===== SIGN WITH ETHERJS (if available) =====
async function signWithEthers() {
  try {
    // Check if ethers is available
    if (typeof ethers === 'undefined') {
      throw new Error('ethers.js is not loaded. Load it first: <script src="https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js"></script>');
    }

    // Connect to MetaMask provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    console.log('Connected Address:', userAddress);
    console.log('Domain:', domain);
    console.log('Message:', message);

    // Sign the typed data
    const signature = await signer._signTypedData(domain, types, message);

    console.log('\n=== Signature ===');
    console.log(signature);

    // Prepare API payload
    const apiPayload = {
      message: message,
      signature: signature,
      userAddress: userAddress
    };

    console.log('\n=== API Payload ===');
    console.log(JSON.stringify(apiPayload, null, 2));

    return { signature, message, userAddress };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// ===== RUN =====
// Uncomment one of these:
// signWithMetaMask();
// signWithEthers();
