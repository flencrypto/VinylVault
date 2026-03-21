use anchor_lang::prelude::*;
use mpl_core::instructions::BurnV1CpiBuilder;

use crate::error::VinylVaultError;
use crate::state::RecordCertificate;

/* ------------------------------------------------------------------ */
/*  Accounts                                                            */
/* ------------------------------------------------------------------ */

#[derive(Accounts)]
pub struct RevokeCertificate<'info> {
    /// The original minter — must match `certificate.authority`.
    #[account(mut)]
    pub authority: Signer<'info>,

    /// The Metaplex Core asset to burn.
    /// CHECK: validated by mpl-core CPI and the certificate constraint below.
    #[account(mut)]
    pub asset: UncheckedAccount<'info>,

    /// The RecordCertificate PDA to close.
    /// Verified against the asset and authority; rent returned to `authority`.
    #[account(
        mut,
        constraint = certificate.asset == asset.key() @ VinylVaultError::AssetMismatch,
        constraint = certificate.authority == authority.key() @ VinylVaultError::Unauthorised,
        seeds = [b"record-cert", asset.key().as_ref()],
        bump = certificate.bump,
        close = authority,
    )]
    pub certificate: Account<'info, RecordCertificate>,

    pub system_program: Program<'info, System>,

    /// CHECK: verified against the canonical mpl-core program ID.
    #[account(address = mpl_core::ID)]
    pub mpl_core_program: UncheckedAccount<'info>,
}

/* ------------------------------------------------------------------ */
/*  Handler                                                             */
/* ------------------------------------------------------------------ */

pub fn handler(ctx: Context<RevokeCertificate>) -> Result<()> {
    // --- Burn the Metaplex Core asset ---
    BurnV1CpiBuilder::new(&ctx.accounts.mpl_core_program)
        .asset(&ctx.accounts.asset)
        .authority(Some(&ctx.accounts.authority))
        .invoke()?;

    // The RecordCertificate PDA is closed and rent reclaimed via the
    // `close = authority` constraint in the Accounts struct above.

    Ok(())
}
