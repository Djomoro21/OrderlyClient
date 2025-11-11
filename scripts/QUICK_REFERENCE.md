# Quick Reference: Manual EIP-712 Signature

## Quick Copy-Paste Template

### JavaScript (Node.js / Browser)

```javascript
// 1. Get registration nonce first
const nonceRes = await fetch('https://api-evm.orderly.org/v1/registration_nonce');
const { data } = await nonceRes.json();
const registrationNonce = data.registration_nonce;

// 2. Prepare your values
const chainId = 80094; // Your chain ID
const brokerId = 'your_broker_id';
const delegateContract = '0x...'; // Your smart contract address
const txHash = '0x...'; // Transaction hash from on-chain delegateSigner call
const timestamp = Date.now();

// 3. EIP-712 Domain
const domain = {
  name: 'Orderly',
  version: '1',
  chainId: chainId,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
};

// 4. EIP-712 Types
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

// 5. Message
const message = {
  delegateContract: delegateContract,
  brokerId: brokerId,
  chainId: chainId,
  timestamp: timestamp,
  registrationNonce: registrationNonce,
  txHash: txHash
};

// 6. Sign with ethers.js
const { ethers } = require('ethers');
const wallet = new ethers.Wallet('YOUR_PRIVATE_KEY');
const signature = await wallet.signTypedData(domain, types, message);

// 7. Or sign with MetaMask (browser)
const signature = await window.ethereum.request({
  method: 'eth_signTypedData_v4',
  params: [
    'YOUR_ADDRESS',
    JSON.stringify({
      domain,
      primaryType: 'DelegateSigner',
      types,
      message
    })
  ]
});

// 8. API Payload
const payload = {
  message: message,
  signature: signature,
  userAddress: 'YOUR_ADDRESS'
};

// 9. Submit to API
const response = await fetch('https://api-evm.orderly.org/v1/delegate_signer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
```

### cURL Example

```bash
# Step 1: Get nonce
NONCE=$(curl -s https://api-evm.orderly.org/v1/registration_nonce | jq -r '.data.registration_nonce')

# Step 2: Generate signature (use one of the scripts)
# Then submit:

curl -X POST https://api-evm.orderly.org/v1/delegate_signer \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "delegateContract": "0x...",
      "brokerId": "your_broker_id",
      "chainId": 80094,
      "timestamp": 1234567890,
      "registrationNonce": '"$NONCE"',
      "txHash": "0x..."
    },
    "signature": "0x...",
    "userAddress": "0x..."
  }'
```

## Chain IDs

- Ethereum: `1` (0x1)
- Arbitrum: `42161` (0xa4b1)
- Optimism: `10` (0xa)
- Base: `8453` (0x2105)
- Berachain: `80094` (0x138de)
- Mantle: `5000` (0x1388)
- Sei: `1329` (0x531)
- BSC: `56` (0x38)
- Mode: `34443` (0x868b)

## API Endpoints

### Mainnet
- Base URL: `https://api-evm.orderly.org`
- Nonce: `GET /v1/registration_nonce`
- Delegate Signer: `POST /v1/delegate_signer`

### Testnet
- Base URL: `https://testnet-api-evm.orderly.org`
- Nonce: `GET /v1/registration_nonce`
- Delegate Signer: `POST /v1/delegate_signer`

## Common Values

- **Verifying Contract** (Off-chain): `0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC`
- **Domain Name**: `Orderly`
- **Domain Version**: `1`
- **Message Type**: `DelegateSigner`

## Verification

```javascript
// Verify signature (ethers.js)
const recoveredAddress = ethers.verifyTypedData(domain, types, message, signature);
console.log('Valid:', recoveredAddress.toLowerCase() === userAddress.toLowerCase());
```
