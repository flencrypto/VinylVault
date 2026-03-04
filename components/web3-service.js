/**
 * VinylVault Web3 Service
 *
 * Handles EIP-1193 wallet connection (MetaMask / any injected provider),
 * network switching to Polygon, and on-chain NFT minting for the
 * Blockchain Authenticity feature.
 *
 * Dependencies: ethers.js v6 (loaded via CDN before this script)
 *
 * Usage:
 *   const wallet = await VinylVaultWeb3.connectWallet();
 *   const result = await VinylVaultWeb3.mintRecordNFT(tokenId, metadata);
 *
 * Contract:
 *   Replace VINYLVAULT_CONTRACT_ADDRESS with your deployed ERC-721 contract
 *   address. The ABI below expects a `safeMint(address to, string memory uri)`
 *   function — a standard OpenZeppelin ERC-721URIStorage extension.
 *
 * ⚠️  This script handles only CLIENT-SIDE wallet interaction. It never stores
 *     private keys and never sends funds without explicit user confirmation in
 *     the wallet UI. Do NOT add any server-side secret handling here.
 */

/* ------------------------------------------------------------------ */
/*  Configuration — update these values before deploying to production */
/* ------------------------------------------------------------------ */

/**
 * Deployed ERC-721 contract address.
 * Replace with your actual contract after deployment.
 * Set to null to disable on-chain minting (local-only fallback will be used).
 *
 * @type {string|null}
 */
const VINYLVAULT_CONTRACT_ADDRESS = null; // TODO: set after contract deployment

/**
 * Supported networks. The service will prompt users to switch to one of these.
 * - Polygon Mainnet  (chainId 137)
 * - Polygon Amoy Testnet (chainId 80002)  ← use this for testing
 */
const SUPPORTED_NETWORKS = {
  137: {
    chainId: "0x89",
    chainName: "Polygon",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com/"],
  },
  80002: {
    chainId: "0x13882",
    chainName: "Polygon Amoy Testnet",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://rpc-amoy.polygon.technology/"],
    blockExplorerUrls: ["https://amoy.polygonscan.com/"],
  },
};

/** Default network to request when the user is on an unsupported chain. */
const DEFAULT_CHAIN_ID = 80002; // Amoy testnet — switch to 137 for mainnet

/* ------------------------------------------------------------------ */
/*  Minimal ERC-721 ABI (safeMint + read helpers)                      */
/* ------------------------------------------------------------------ */

const VINYLVAULT_NFT_ABI = [
  // Mint a new token. Must match your contract's mint function signature.
  "function safeMint(address to, string memory uri) external returns (uint256)",
  // Standard ERC-721 helpers
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function balanceOf(address owner) external view returns (uint256)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

/* ------------------------------------------------------------------ */
/*  Internal state                                                      */
/* ------------------------------------------------------------------ */

const _state = {
  account: null,
  chainId: null,
  provider: null,
  signer: null,
};

const _listeners = {
  accountChange: [],
  networkChange: [],
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function _notifyAccountChange(account) {
  _listeners.accountChange.forEach((cb) => {
    try { cb(account); } catch (_e) { /* ignore */ }
  });
}

function _notifyNetworkChange(chainId) {
  _listeners.networkChange.forEach((cb) => {
    try { cb(chainId); } catch (_e) { /* ignore */ }
  });
}

function _isEthersAvailable() {
  return typeof window !== "undefined" && typeof window.ethers !== "undefined";
}

function _isWalletAvailable() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

function _shortAddress(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

function _getNetworkName(chainId) {
  const net = SUPPORTED_NETWORKS[Number(chainId)];
  return net ? net.chainName : `Chain ${chainId}`;
}

function _isSupportedNetwork(chainId) {
  return Object.keys(SUPPORTED_NETWORKS).map(Number).includes(Number(chainId));
}

/* ------------------------------------------------------------------ */
/*  Public API — VinylVaultWeb3                                         */
/* ------------------------------------------------------------------ */

const VinylVaultWeb3 = {
  /** Returns true if a wallet is already connected. */
  isConnected() {
    return Boolean(_state.account);
  },

  /** Returns the connected account address or null. */
  getAccount() {
    return _state.account;
  },

  /** Returns the connected chain ID (number) or null. */
  getChainId() {
    return _state.chainId;
  },

  /** Returns a human-readable network name for the connected chain. */
  getNetworkName() {
    return _state.chainId ? _getNetworkName(_state.chainId) : "—";
  },

  /** Returns a shortened "0x1234…5678" version of the connected address. */
  getShortAddress() {
    return _shortAddress(_state.account);
  },

  /**
   * Connect the user's injected wallet (MetaMask, Brave, Rabby, etc.).
   * Requests account access, then optionally switches to the preferred network.
   *
   * @returns {Promise<{account: string, chainId: number, networkName: string}>}
   * @throws  {Error} if no wallet is detected or the user rejects the request.
   */
  async connectWallet() {
    if (!_isWalletAvailable()) {
      throw new Error(
        "No Web3 wallet detected. Please install MetaMask (metamask.io) or another EIP-1193 wallet."
      );
    }
    if (!_isEthersAvailable()) {
      throw new Error(
        "ethers.js is not loaded. Ensure the ethers CDN script is included before web3-service.js."
      );
    }

    // Request accounts
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts returned. Did you reject the wallet connection?");
    }

    // Build ethers provider
    _state.provider = new window.ethers.BrowserProvider(window.ethereum);
    _state.signer = await _state.provider.getSigner();
    _state.account = await _state.signer.getAddress();

    // Get current chain
    const network = await _state.provider.getNetwork();
    _state.chainId = Number(network.chainId);

    // Register provider-level change listeners (once)
    if (!window._vfWeb3ListenersRegistered) {
      window._vfWeb3ListenersRegistered = true;

      window.ethereum.on("accountsChanged", (accs) => {
        _state.account = accs.length > 0 ? accs[0] : null;
        if (accs.length === 0) {
          _state.signer = null;
          _state.provider = null;
          _state.chainId = null;
        }
        _notifyAccountChange(_state.account);
      });

      window.ethereum.on("chainChanged", (hexChainId) => {
        _state.chainId = parseInt(hexChainId, 16);
        // Refresh signer after chain switch
        if (_state.provider) {
          _state.provider.getSigner().then((s) => { _state.signer = s; }).catch(() => {});
        }
        _notifyNetworkChange(_state.chainId);
      });
    }

    // Switch to preferred network if not already on a supported one
    if (!_isSupportedNetwork(_state.chainId)) {
      await this.switchToPreferredNetwork();
      const net2 = await _state.provider.getNetwork();
      _state.chainId = Number(net2.chainId);
    }

    _notifyAccountChange(_state.account);
    return {
      account: _state.account,
      chainId: _state.chainId,
      networkName: _getNetworkName(_state.chainId),
    };
  },

  /**
   * Disconnect — clears local state (the wallet extension itself stays connected;
   * true "disconnect" is only possible through the wallet UI).
   */
  disconnectWallet() {
    _state.account = null;
    _state.chainId = null;
    _state.provider = null;
    _state.signer = null;
    _notifyAccountChange(null);
  },

  /**
   * Ask the wallet to switch to (or add) the DEFAULT_CHAIN_ID network.
   */
  async switchToPreferredNetwork() {
    const target = SUPPORTED_NETWORKS[DEFAULT_CHAIN_ID];
    if (!target || !_isWalletAvailable()) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: target.chainId }],
      });
    } catch (err) {
      // Error 4902 = chain not added yet → add it
      if (err && err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [target],
        });
      } else {
        throw err;
      }
    }
  },

  /**
   * Mint a record certificate NFT on-chain.
   *
   * Requires:
   *  - Wallet connected (calls connectWallet() automatically if not)
   *  - VINYLVAULT_CONTRACT_ADDRESS set (otherwise throws with clear message)
   *
   * @param {string} tokenId   - Off-chain token ID (e.g. "VX-A1B2-C3D4"), used as part of metadata URI
   * @param {object} metadata  - Record metadata { artist, title, year, catno, condition }
   * @returns {Promise<{txHash: string, tokenId: string, explorerUrl: string}>}
   */
  async mintRecordNFT(tokenId, metadata) {
    if (!VINYLVAULT_CONTRACT_ADDRESS) {
      const err = new Error(
        "On-chain minting is not yet configured. " +
        "Set VINYLVAULT_CONTRACT_ADDRESS in components/web3-service.js after deploying your contract."
      );
      err.code = "CONTRACT_NOT_CONFIGURED";
      throw err;
    }

    if (!_isEthersAvailable()) {
      throw new Error("ethers.js is not available.");
    }

    // Auto-connect if needed
    if (!this.isConnected()) {
      await this.connectWallet();
    }

    if (!_isSupportedNetwork(_state.chainId)) {
      await this.switchToPreferredNetwork();
    }

    // Build token URI (a JSON data URI with the record metadata)
    const tokenURIData = {
      name: `${metadata.artist || "Unknown"} — ${metadata.title || "Unknown"}`,
      description: `VinylVault authenticity certificate for this vinyl record.`,
      attributes: [
        { trait_type: "Artist",    value: metadata.artist    || "" },
        { trait_type: "Title",     value: metadata.title     || "" },
        { trait_type: "Year",      value: metadata.year      || "" },
        { trait_type: "Cat No",    value: metadata.catno     || "" },
        { trait_type: "Condition", value: metadata.condition || "" },
        { trait_type: "Token ID",  value: tokenId },
      ],
      external_url: "https://vinylvault.app",
    };
    const tokenURI = "data:application/json;base64," +
      btoa(unescape(encodeURIComponent(JSON.stringify(tokenURIData))));

    const contract = new window.ethers.Contract(
      VINYLVAULT_CONTRACT_ADDRESS,
      VINYLVAULT_NFT_ABI,
      _state.signer
    );

    const tx = await contract.safeMint(_state.account, tokenURI);
    const receipt = await tx.wait();

    const net = SUPPORTED_NETWORKS[_state.chainId];
    const explorerBase = net ? net.blockExplorerUrls[0] : "";
    const explorerUrl = explorerBase ? `${explorerBase}tx/${receipt.hash}` : "";

    return { txHash: receipt.hash, tokenId, explorerUrl };
  },

  /**
   * Register a callback for account changes.
   * Callback receives the new address (string) or null on disconnect.
   *
   * @param {function(string|null): void} callback
   */
  onAccountChange(callback) {
    if (typeof callback === "function") {
      _listeners.accountChange.push(callback);
    }
  },

  /**
   * Register a callback for network/chain changes.
   * Callback receives the new chainId (number).
   *
   * @param {function(number): void} callback
   */
  onNetworkChange(callback) {
    if (typeof callback === "function") {
      _listeners.networkChange.push(callback);
    }
  },

  // Expose helpers for UI use
  shortAddress: _shortAddress,
  getNetworkNameById: _getNetworkName,
  isSupportedNetwork: _isSupportedNetwork,
  isWalletAvailable: _isWalletAvailable,
};

// Make available globally (matches the pattern used by other components)
window.VinylVaultWeb3 = VinylVaultWeb3;
