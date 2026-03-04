use anchor_lang::prelude::*;

#[error_code]
pub enum VinylVaultError {
    /// A string argument exceeds its maximum allowed byte length.
    #[msg("String field exceeds maximum length")]
    StringTooLong,

    /// The signer is not the original authority of this certificate.
    #[msg("You are not authorised to perform this action")]
    Unauthorised,

    /// The mint account provided does not match the certificate's stored mint.
    #[msg("Mint does not match the certificate")]
    MintMismatch,
}
