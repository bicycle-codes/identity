import { CharSize, HashAlg, RsaSize, SymmKeyLength } from './types'

export const DEFAULT_CHAR_SIZE = CharSize.B16
export const DEFAULT_HASH_ALGORITHM = HashAlg.SHA_256
export const SALT_LENGTH = 128
export const SYMM_ALGORITHM = 'AES-GCM'
export const RSA_ALGORITHM = 'RSA-OAEP'
export const RSA_SIGN_ALG = 'RSASSA-PKCS1-v1_5'
export const BASE58_DID_PREFIX = 'did:key:z'
export const DEFAULT_ENCRYPTION_KEY_NAME = 'encryption-key'
export const DEFAULT_SIGNING_KEY_NAME = 'signing-key'
export const DEFAULT_RSA_SIZE = RsaSize.B2048
export const DEFAULT_HASH_ALG = HashAlg.SHA_256
export const AES_GCM = 'AES-GCM' as const
export const DEFAULT_SYMM_ALGORITHM = AES_GCM
export const DEFAULT_SYMM_LENGTH = SymmKeyLength.B256
export const RSA_HASHING_ALGORITHM = 'SHA-256'
export const EDWARDS_DID_PREFIX = new Uint8Array([0xed, 0x01])
export const BLS_DID_PREFIX = new Uint8Array([0xea, 0x01])
export const RSA_DID_PREFIX = new Uint8Array([0x00, 0xf5, 0x02])

