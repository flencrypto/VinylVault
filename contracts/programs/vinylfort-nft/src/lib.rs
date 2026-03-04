use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

use instructions::*;

// Replace this with your program's actual public key after running:
//   anchor keys generate   (generates a fresh keypair in target/deploy/)
//   anchor build           (embeds the key from target/deploy/ into the binary)
// Then update:
//   - Anchor.toml   [programs.*] section
//   - contracts/idl/vinylfort_nft.json  "address" field
//   - components/web3-service.js  VINYLFORT_PROGRAM_ID constant
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod vinylfort_nft {
    use super::*;

    /// Mint a new vinyl-record NFT certificate on-chain.
    ///
    /// Creates an SPL token mint (0 decimals, supply 1) and stores the full
    /// record metadata in a `RecordCertificate` PDA. The mint authority is
    /// irrevocably removed after minting, making this a true 1/1 NFT.
    pub fn mint_record_nft(ctx: Context<MintRecordNft>, args: MintRecordArgs) -> Result<()> {
        instructions::mint_record::handler(ctx, args)
    }

    /// Revoke a previously minted certificate.
    ///
    /// Burns the NFT token, closes the token account, and closes the
    /// `RecordCertificate` PDA, returning all rent to the authority.
    /// Only the original minter can call this.
    pub fn revoke_certificate(ctx: Context<RevokeCertificate>) -> Result<()> {
        instructions::revoke_certificate::handler(ctx)
    }
}
