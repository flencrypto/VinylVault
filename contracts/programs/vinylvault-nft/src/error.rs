use anchor_lang::prelude::*;

#[error_code]
pub enum VinylVaultError {
    /// A string argument exceeds its maximum allowed byte length.
    #[msg("String field exceeds maximum length")]
    StringTooLong,

    /// The signer is not the original authority of this certificate.
    #[msg("You are not authorised to perform this action")]
    Unauthorised,

    /// The asset account provided does not match the certificate's stored asset.
    #[msg("Asset does not match the certificate")]
    AssetMismatch,
}
