export enum HashAlg {
    SHA_1 = 'SHA-1',
    SHA_256 = 'SHA-256',
    SHA_384 = 'SHA-384',
    SHA_512 = 'SHA-512',
}

export enum CharSize {
    B8 = 8,
    B16 = 16,
}

export type Msg = ArrayBuffer|string|Uint8Array
