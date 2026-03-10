use anchor_lang::prelude::*;
use mpl_core::instructions::CreateV1CpiBuilder;

use crate::error::VinylVaultError;
use crate::state::RecordCertificate;

/* ------------------------------------------------------------------ */
/*  Accounts                                                            */
/* ------------------------------------------------------------------ */

#[derive(Accounts)]
#[instruction(args: MintRecordArgs)]
pub struct MintRecordNft<'info> {
    /// The wallet that is minting and paying for the certificate.
    #[account(mut)]
    pub authority: Signer<'info>,

    /// Freshly-generated Metaplex Core asset account.
    /// The keypair must be passed in by the client and signed as a co-signer.
    /// CHECK: created by mpl-core CPI; account structure is validated there.
    #[account(mut)]
    pub asset: Signer<'info>,

    /// PDA that permanently stores the extended record metadata on-chain.
    /// Seeds: ["record-cert", asset.key()]
    #[account(
        init,
        payer = authority,
        space = RecordCertificate::SPACE,
        seeds = [b"record-cert", asset.key().as_ref()],
        bump,
    )]
    pub certificate: Account<'info, RecordCertificate>,

    pub system_program: Program<'info, System>,

    /// CHECK: verified against the canonical mpl-core program ID.
    #[account(address = mpl_core::ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
}

/* ------------------------------------------------------------------ */
/*  Instruction arguments                                               */
/* ------------------------------------------------------------------ */

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MintRecordArgs {
    /// VinylVault off-chain token identifier (max 32 bytes).
    pub token_id: String,
    /// Artist name (max 128 bytes).
    pub artist: String,
    /// Album / record title (max 128 bytes).
    pub title: String,
    /// Release year string, e.g. "1972" (max 16 bytes).
    pub year: String,
    /// Catalogue number (max 64 bytes).
    pub catno: String,
    /// Grading condition, e.g. "NM" (max 32 bytes).
    pub condition: String,
    /// Optional URI to off-chain JSON metadata (max 200 bytes).
    pub metadata_uri: String,
}

/* ------------------------------------------------------------------ */
/*  Handler                                                             */
/* ------------------------------------------------------------------ */

pub fn handler(ctx: Context<MintRecordNft>, args: MintRecordArgs) -> Result<()> {
    // --- Validate string lengths against on-chain constraints ---
    require!(args.token_id.len() <= 32, VinylVaultError::StringTooLong);
    require!(args.artist.len() <= 128, VinylVaultError::StringTooLong);
    require!(args.title.len() <= 128, VinylVaultError::StringTooLong);
    require!(args.year.len() <= 16, VinylVaultError::StringTooLong);
    require!(args.catno.len() <= 64, VinylVaultError::StringTooLong);
    require!(args.condition.len() <= 32, VinylVaultError::StringTooLong);
    require!(args.metadata_uri.len() <= 200, VinylVaultError::StringTooLong);

    // Build a display name: "Artist - Title"
    let asset_name = format!("{} - {}", args.artist, args.title);

    // --- Create the Metaplex Core asset (1/1 NFT) ---
    CreateV1CpiBuilder::new(&ctx.accounts.mpl_core_program)
        .asset(&ctx.accounts.asset)
        .authority(Some(&ctx.accounts.authority))
        .payer(&ctx.accounts.authority)
        .owner(Some(&ctx.accounts.authority))
        .name(asset_name)
        .uri(args.metadata_uri.clone())
        .invoke()?;

    // --- Populate the RecordCertificate PDA ---
    let cert = &mut ctx.accounts.certificate;
    cert.authority = ctx.accounts.authority.key();
    cert.asset = ctx.accounts.asset.key();
    cert.token_id = args.token_id;
    cert.artist = args.artist;
    cert.title = args.title;
    cert.year = args.year;
    cert.catno = args.catno;
    cert.condition = args.condition;
    cert.metadata_uri = args.metadata_uri;
    cert.minted_at = Clock::get()?.unix_timestamp;
    // NOTE: Solana's on-chain clock can be influenced by validators within a
    // small bounded range (~±few seconds). For certificate timestamping this
    // precision is sufficient; for applications requiring stricter guarantees
    // an off-chain oracle (e.g. Chainlink) should be used instead.
    cert.bump = ctx.bumps.certificate;

    Ok(())
}
