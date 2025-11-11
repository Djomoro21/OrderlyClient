// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract DiracOrderlyVault is ERC4626, Ownable {
    using SafeERC20 for IERC20;

    uint256 public totalReceived;
    address public orderlyVault;
    address public delegateSigner;
    bytes32 public brokerHash;
    bytes32 public tokenHash;
    
    // bytes32 public accountId;
    
    // bool public isDelegateSet;

    event DelegateSignerSet(address indexed signer, bytes32 txHash);
    event FundsDeployedToOrderly(uint256 amount);
    event OrderlyVaultUpdated(address indexed newVault);
    event BrokerHashUpdated(bytes32 newBrokerHash);
    event TokenHashUpdated(bytes32 newTokenHash);

    constructor(
        IERC20 _usdc,
        address _orderlyVault,
        string memory _name,
        string memory _symbol
    ) ERC4626(_usdc) ERC20(_name, _symbol) Ownable(msg.sender) {
        require(_orderlyVault != address(0), "Invalid Orderly vault");
        orderlyVault = _orderlyVault;
        brokerHash = 0x06bc873ee2707d92a1e23b12e5de4a5c63f35b28bab72ea15d1052985371773a;
        tokenHash = 0xd6aca1be9729c13d677335161321649cccae6a591554772516700f986f942eaa;
    
    }


    function setDelegateSigner(
        address _delegateSigner
    ) external onlyOwner {
        require(_delegateSigner != address(0), "Invalid delegate signer");
        
        delegateSigner = _delegateSigner;
        
        VaultTypes.VaultDelegate memory delegateData = VaultTypes.VaultDelegate({
            brokerHash: brokerHash,
            delegateSigner: _delegateSigner
        });
        
        IOrderlyVault(orderlyVault).delegateSigner(delegateData);
        
        emit DelegateSignerSet(_delegateSigner, bytes32(0));
    }


    function deployFundsToOrderly(bytes32 _accountID, uint256 fee) external onlyOwner {
        
       IERC20 underlyingAsset = IERC20(asset());
        uint256 availableBalance = underlyingAsset.balanceOf(address(this));
        
        require(availableBalance > 0, "No funds available to deploy");
        require(availableBalance <= type(uint128).max, "Balance exceeds uint128 max");
        
        uint128 amount = uint128(availableBalance);
        
        VaultTypes.VaultDepositFE memory depositData = VaultTypes.VaultDepositFE({
            accountId: _accountID,
            brokerHash: brokerHash,
            tokenHash: tokenHash,
            tokenAmount: amount
        });

        underlyingAsset.approve(orderlyVault, 0);
        underlyingAsset.approve(orderlyVault, amount);
        
        IOrderlyVault(orderlyVault).deposit{value: fee }(depositData);
        
        emit FundsDeployedToOrderly(amount);
    }

    // Getters et Setter
    function updateOrderlyVault(address _newVault) external onlyOwner {
        require(_newVault != address(0), "Invalid vault address");
        orderlyVault = _newVault;
        emit OrderlyVaultUpdated(_newVault);
    }

    function updateBrokerHash(bytes32 _brokerHash) external onlyOwner {
        brokerHash = _brokerHash;
        emit BrokerHashUpdated(_brokerHash);
    }

    function updateTokenHash(bytes32 _tokenHash) external onlyOwner {
        tokenHash = _tokenHash;
        emit TokenHashUpdated(_tokenHash);
    }

    function totalAssets() public view virtual override returns (uint256) {
        return IERC20(asset()).balanceOf(address(this));
    }

    receive() external payable {
        totalReceived += msg.value;
    }

    fallback() external payable {
        totalReceived += msg.value;
    }

    function getTotalReceived() external view returns (uint256) {
        return totalReceived;
    }

}

// Orderly Vault Types
library VaultTypes {
    struct VaultDelegate {
        bytes32 brokerHash;
        address delegateSigner;
    }
    
    struct VaultDepositFE {
        bytes32 accountId;
        bytes32 brokerHash;
        bytes32 tokenHash;
        uint128 tokenAmount;
    }
    
    struct VaultWithdraw {
        bytes32 accountId;
        bytes32 brokerHash;
        bytes32 tokenHash;
        uint128 tokenAmount;
        uint128 fee;
        address sender;
        address receiver;
        uint64 withdrawNonce;
    }
}

// Orderly Vault Interface
interface IOrderlyVault {
    function delegateSigner(VaultTypes.VaultDelegate calldata data) external;

    function deposit(VaultTypes.VaultDepositFE calldata data) external payable;
    
    function withdraw(
        VaultTypes.VaultWithdraw calldata data
    ) external;
}
