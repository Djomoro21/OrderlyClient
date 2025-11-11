/**
 * Manual EIP-712 Signature Generator for Delegate Signer
 * 
 * This script demonstrates how to manually create the EIP-712 signature
 * for accepting a delegate signer link.
 * 
 * Usage:
 *   node scripts/manual-sign-delegate.js
 * 
 * Or in browser console (with ethers.js available)
 */

const { ethers } = require('ethers');

// Configuration - Update these values
const CONFIG = {
  // Chain ID (e.g., 80094 for Berachain, 1 for Ethereum)
  chainId: 80094,
  
  // Your broker ID
  brokerId: 'your_broker_id',
  
  // Delegate contract address (e.g., Gnosis Safe address)
  delegateContract: '0x0000000000000000000000000000000000000000',
  
  // Transaction hash from the on-chain delegateSigner call
  txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  
  // Registration nonce from Orderly API
  registrationNonce: 0,
  
  // Timestamp (milliseconds)
  timestamp: Date.now(),
  
  // Your wallet private key (NEVER share this in production!)
  // For testing only - use a test wallet
  privateKey: '0x0000000000000000000000000000000000000000000000000000000000000000'
};

// EIP-712 Domain
const domain = {
  name: 'Orderly',
  version: '1',
  chainId: CONFIG.chainId,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
};

// EIP-712 Types
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

// Message to sign
const message = {
  delegateContract: CONFIG.delegateContract,
  brokerId: CONFIG.brokerId,
  chainId: CONFIG.chainId,
  timestamp: CONFIG.timestamp,
  registrationNonce: CONFIG.registrationNonce,
  txHash: CONFIG.txHash
};

async function generateSignature() {
  try {
    // Create wallet from private key
    const wallet = new ethers.Wallet(CONFIG.privateKey);
    
    console.log('Wallet Address:', wallet.address);
    console.log('\n=== EIP-712 Domain ===');
    console.log(JSON.stringify(domain, null, 2));
    
    console.log('\n=== Message to Sign ===');
    console.log(JSON.stringify(message, null, 2));
    
    // Sign the typed data
    const signature = await wallet.signTypedData(domain, types, message);
    
    console.log('\n=== Signature ===');
    console.log(signature);
    
    // Verify the signature
    const recoveredAddress = ethers.verifyTypedData(domain, types, message, signature);
    console.log('\n=== Verification ===');
    console.log('Expected Address:', wallet.address);
    console.log('Recovered Address:', recoveredAddress);
    console.log('Signature Valid:', recoveredAddress.toLowerCase() === wallet.address.toLowerCase());
    
    // Output the complete payload for API
    console.log('\n=== API Payload ===');
    console.log(JSON.stringify({
      message: message,
      signature: signature,
      userAddress: wallet.address
    }, null, 2));
    
    return {
      signature,
      message,
      userAddress: wallet.address
    };
  } catch (error) {
    console.error('Error generating signature:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  console.log('⚠️  WARNING: Make sure to update CONFIG values before running!');
  console.log('⚠️  NEVER use a real private key in scripts!\n');
  
  generateSignature()
    .then(() => {
      console.log('\n✅ Signature generated successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
}

module.exports = { generateSignature, domain, types };
