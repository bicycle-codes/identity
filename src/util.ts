export enum RsaSize {
    B1024 = 1024,
    B2048 = 2048,
    B4096 = 4096
}

export enum HashAlg {
    SHA_1 = 'SHA-1',
    SHA_256 = 'SHA-256',
    SHA_384 = 'SHA-384',
    SHA_512 = 'SHA-512',
}

export enum KeyUse {
    Exchange = 'exchange',  // encrypt/decrypt
    Write = 'write',  // sign
}
