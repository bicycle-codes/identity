export enum HashAlg {
    SHA_1 = 'SHA-1',
    SHA_256 = 'SHA-256',
    SHA_384 = 'SHA-384',
    SHA_512 = 'SHA-512',
}

export type DID = `did:key:z${string}`

export enum CharSize {
    B8 = 8,
    B16 = 16,
}

export type Msg = ArrayBuffer|string|Uint8Array

export enum SymmKeyLength {
    B128 = 128,
    B192 = 192,
    B256 = 256,
}

export enum RsaSize {
    B1024 = 1024,
    B2048 = 2048,
    B4096 = 4096
}

export type SymmKey = CryptoKey
export type PublicKey = CryptoKey

export type SymmAlg = 'AES-CTR'|'AES-CBC'|'AES-GCM'

export type SymmKeyOpts = {
    alg:SymmAlg
    length:SymmKeyLength
    iv:ArrayBuffer
}

export type SymmKeyAlgorithm = 'AES_GCM'

export interface Device {
    name:string;  // random, collision resistant name
    humanReadableName:string;
    did:DID;
    aes:string;  /* the symmetric key for this account, encrypted to the
      exchange key for this device */
    encryptionKey:string;  // encryption key, stringified
}

/**
 * `devices` is a map of `{ <deviceName>: Device }`, where `device.aes` is the
 * AES key encrypted to this exchange key. The private side of this exchange
 * key is stored only on-device, in a keystore instance.
 */
export interface SerializedIdentity {
    humanName:string;
    username:string;
    DID:DID;
    rootDID:DID;
    rootDeviceName:string;
    devices:Record<string, Device>;
    storage:{ encryptionKeyName:string; signingKeyName:string; }
}

/**
 * A record for an encrypted message. Contains `devices`, a record like
 *  `{ deviceName: <encrypted key> }`
 * You would decrypt the encrypted key -- message.devices[my-device-name] --
 *   with the device's `encrypt` key
 * Then use the decrypted key to decrypt the payload
 */
export interface EncryptedMessage<T extends string = string> {
    payload:T, /* This is the message, encrypted with the symm key for
        the message */
    devices:Record<string, string>  /* a map from `deviceName` to this
        messages's encrypted AES key, encrypted to that device */
}
