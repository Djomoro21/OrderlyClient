# Manual EIP-712 Signature Generation

This directory contains scripts to manually generate EIP-712 signatures for the Delegate Signer registration.

## Overview

The signature is created using EIP-712 (Typed Data Signing) with the following structure:

### Domain
```javascript
{
  name: 'Orderly',
  version: '1',
  chainId: 80094, // Your chain ID
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
}
```

### Message Types
```javascript
DelegateSigner: [
  { name: 'delegateContract', type: 'address' },
  { name: 'brokerId', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'timestamp', type: 'uint64' },
  { name: 'registrationNonce', type: 'uint256' },
  { name: 'txHash', type: 'bytes32' }
]
```

### Message
```javascript
{
  delegateContract: '0x...',      // Smart contract address
  brokerId: 'broker_123',          // Your broker ID
  chainId: 80094,                  // Chain ID
  timestamp: 1234567890,           // Current timestamp (ms)
  registrationNonce: 12345,        // From API
  txHash: '0x...'                  // On-chain transaction hash
}
```

## Methods

### 1. Node.js Script (Recommended)

**File:** `manual-sign-delegate.js`

**Requirements:**
```bash
npm install ethers
```

**Usage:**
1. Update the `CONFIG` object with your values
2. Run: `node scripts/manual-sign-delegate.js`

**Example:**
```bash
# Edit the script first
node scripts/manual-sign-delegate.js
```

### 2. Browser Console (MetaMask)

**File:** `manual-sign-browser.js`

**Requirements:**
- MetaMask installed
- Connected to the correct network

**Usage:**
1. Open browser console (F12)
2. Connect MetaMask to the correct network
3. Update the `config` object in the script
4. Paste and run the script
5. Approve the signature request in MetaMask

**Example:**
```javascript
// In browser console
// 1. Update config values
// 2. Run: signWithMetaMask()
```

### 3. Python Script

**File:** `manual-sign-python.py`

**Requirements:**
```bash
pip install eth-account web3
```

**Usage:**
1. Update the `CONFIG` dictionary with your values
2. Run: `python scripts/manual-sign-python.py`

**Example:**
```bash
# Edit the script first
python scripts/manual-sign-python.py
```

## Step-by-Step Process

### Step 1: Get Registration Nonce

```bash
# Mainnet
curl https://api-evm.orderly.org/v1/registration_nonce

# Testnet
curl https://testnet-api-evm.orderly.org/v1/registration_nonce
```

Response:
```json
{
  "success": true,
  "data": {
    "registration_nonce": 12345
  }
}
```

### Step 2: Prepare Your Data

You need:
- **Chain ID**: e.g., `80094` for Berachain
- **Broker ID**: Your broker identifier
- **Delegate Contract**: Your smart contract address (e.g., Gnosis Safe)
- **Transaction Hash**: The hash from your on-chain `delegateSigner` transaction
- **Registration Nonce**: From Step 1
- **Timestamp**: Current time in milliseconds

### Step 3: Generate Signature

Use one of the scripts above to generate the signature.

### Step 4: Submit to API

```bash
curl -X POST https://api-evm.orderly.org/v1/delegate_signer \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "delegateContract": "0x...",
      "brokerId": "broker_123",
      "chainId": 80094,
      "timestamp": 1234567890,
      "registrationNonce": 12345,
      "txHash": "0x..."
    },
    "signature": "0x...",
    "userAddress": "0x..."
  }'
```

## Security Notes

⚠️ **IMPORTANT:**
- Never share your private key
- Use test wallets for testing
- Always verify the signature before submitting
- Double-check all values before signing
- The `txHash` must match your on-chain transaction

## Verification

You can verify the signature using:

### JavaScript (ethers.js)
```javascript
const recoveredAddress = ethers.verifyTypedData(domain, types, message, signature);
console.log('Recovered:', recoveredAddress);
console.log('Expected:', userAddress);
console.log('Valid:', recoveredAddress.toLowerCase() === userAddress.toLowerCase());
```

### Python
```python
from eth_account import Account
from eth_account.messages import encode_structured_data

encoded = encode_structured_data(structured_data)
recovered_address = Account.recover_message(encoded, signature=signature)
print(f"Recovered: {recovered_address}")
print(f"Expected: {user_address}")
print(f"Valid: {recovered_address.lower() == user_address.lower()}")
```

## Troubleshooting

### Common Issues

1. **"Invalid signature"**
   - Check that all message values are correct
   - Verify the chain ID matches
   - Ensure timestamp is recent
   - Confirm nonce is from the API

2. **"Transaction hash not found"**
   - Verify the txHash is correct
   - Check the transaction was confirmed on-chain
   - Ensure it's the correct transaction

3. **"Nonce mismatch"**
   - Fetch a fresh nonce from the API
   - Don't reuse nonces

4. **"Wrong network"**
   - Ensure you're connected to the correct chain
   - Verify chain ID in domain matches

## Resources

- [EIP-712 Specification](https://eips.ethereum.org/EIPS/eip-712)
- [ethers.js Documentation](https://docs.ethers.io/)
- [Orderly Network Documentation](https://orderly.network/docs)
