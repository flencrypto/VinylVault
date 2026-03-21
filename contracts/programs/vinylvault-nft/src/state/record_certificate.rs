use anchor_lang::prelude::*;

/// On-chain record-certificate account.
///
/// Stored at PDA seeds = ["record-cert", asset.key()].
/// The asset is a Metaplex Core NFT whose ownership tracks the vinyl record
/// certificate.  Burning the Core asset revokes the certificate.
#[account]
#[derive(InitSpace)]
pub struct RecordCertificate {
    /// Wallet that minted this certificate and has revoke rights.
    pub authority: Pubkey, // 32

    /// Metaplex Core asset address for this NFT.
    pub asset: Pubkey, // 32

    /// VinylVault off-chain token identifier (e.g. "VX-A1B2-C3D4").
    #[max_len(32)]
    pub token_id: String, // 4 + 32

    /// Artist name.
    #[max_len(128)]
    pub artist: String, // 4 + 128

    /// Album / record title.
    #[max_len(128)]
    pub title: String, // 4 + 128

    /// Release year string (e.g. "1972").
    #[max_len(16)]
    pub year: String, // 4 + 16

    /// Catalogue number.
    #[max_len(64)]
    pub catno: String, // 4 + 64

    /// Grading condition (e.g. "NM", "VG+").
    #[max_len(32)]
    pub condition: String, // 4 + 32

    /// Optional URI pointing to off-chain JSON metadata (IPFS, Arweave, etc.).
    /// This URI is also stored in the Metaplex Core asset; leave empty if
    /// metadata is fully on-chain in this account.
    #[max_len(200)]
    pub metadata_uri: String, // 4 + 200

    /// Unix timestamp (seconds) when this certificate was minted.
    pub minted_at: i64, // 8

    /// PDA bump seed.
    pub bump: u8, // 1
}

impl RecordCertificate {
    /// Discriminator (8) + InitSpace
    pub const SPACE: usize = 8 + Self::INIT_SPACE;
}
