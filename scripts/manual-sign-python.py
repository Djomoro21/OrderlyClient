#!/usr/bin/env python3
"""
Manual EIP-712 Signature Generator for Delegate Signer (Python)

This script demonstrates how to manually create the EIP-712 signature
using Python and eth_account.

Install dependencies:
    pip install eth-account web3

Usage:
    python scripts/manual-sign-python.py
"""

from eth_account import Account
from eth_account.messages import encode_structured_data
import json
from datetime import datetime

# ===== CONFIGURATION - UPDATE THESE VALUES =====
CONFIG = {
    # Chain ID (e.g., 80094 for Berachain, 1 for Ethereum)
    "chain_id": 80094,
    
    # Your broker ID
    "broker_id": "your_broker_id",
    
    # Delegate contract address (e.g., Gnosis Safe address)
    "delegate_contract": "0x0000000000000000000000000000000000000000",
    
    # Transaction hash from the on-chain delegateSigner call
    "tx_hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    
    # Registration nonce from Orderly API
    "registration_nonce": 0,
    
    # Timestamp (milliseconds)
    "timestamp": int(datetime.now().timestamp() * 1000),
    
    # Your wallet private key (NEVER share this in production!)
    # For testing only - use a test wallet
    "private_key": "0x0000000000000000000000000000000000000000000000000000000000000000"
}

# ===== EIP-712 DOMAIN =====
domain = {
    "name": "Orderly",
    "version": "1",
    "chainId": CONFIG["chain_id"],
    "verifyingContract": "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"
}

# ===== EIP-712 TYPES =====
types = {
    "EIP712Domain": [
        {"name": "name", "type": "string"},
        {"name": "version", "type": "string"},
        {"name": "chainId", "type": "uint256"},
        {"name": "verifyingContract", "type": "address"}
    ],
    "DelegateSigner": [
        {"name": "delegateContract", "type": "address"},
        {"name": "brokerId", "type": "string"},
        {"name": "chainId", "type": "uint256"},
        {"name": "timestamp", "type": "uint64"},
        {"name": "registrationNonce", "type": "uint256"},
        {"name": "txHash", "type": "bytes32"}
    ]
}

# ===== MESSAGE =====
message = {
    "delegateContract": CONFIG["delegate_contract"],
    "brokerId": CONFIG["broker_id"],
    "chainId": CONFIG["chain_id"],
    "timestamp": CONFIG["timestamp"],
    "registrationNonce": CONFIG["registration_nonce"],
    "txHash": CONFIG["tx_hash"]
}

def generate_signature():
    """Generate EIP-712 signature for delegate signer message"""
    try:
        # Create account from private key
        account = Account.from_key(CONFIG["private_key"])
        
        print(f"Wallet Address: {account.address}")
        print("\n=== EIP-712 Domain ===")
        print(json.dumps(domain, indent=2))
        
        print("\n=== Message to Sign ===")
        print(json.dumps(message, indent=2))
        
        # Create the structured data
        structured_data = {
            "types": types,
            "domain": domain,
            "primaryType": "DelegateSigner",
            "message": message
        }
        
        # Encode and sign
        encoded = encode_structured_data(structured_data)
        signed = account.sign_message(encoded)
        signature = signed.signature.hex()
        
        print("\n=== Signature ===")
        print(signature)
        
        # Verify the signature
        recovered_address = Account.recover_message(encoded, signature=signed.signature)
        print("\n=== Verification ===")
        print(f"Expected Address: {account.address}")
        print(f"Recovered Address: {recovered_address}")
        print(f"Signature Valid: {recovered_address.lower() == account.address.lower()}")
        
        # Output the complete payload for API
        api_payload = {
            "message": message,
            "signature": signature,
            "userAddress": account.address
        }
        
        print("\n=== API Payload ===")
        print(json.dumps(api_payload, indent=2))
        
        return {
            "signature": signature,
            "message": message,
            "userAddress": account.address
        }
    except Exception as error:
        print(f"Error generating signature: {error}")
        raise

if __name__ == "__main__":
    print("⚠️  WARNING: Make sure to update CONFIG values before running!")
    print("⚠️  NEVER use a real private key in scripts!\n")
    
    try:
        generate_signature()
        print("\n✅ Signature generated successfully!")
    except Exception as error:
        print(f"\n❌ Error: {error}")
        exit(1)
