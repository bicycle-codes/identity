import * as uint8arrays from 'uint8arrays'
import { webcrypto } from '@bicycle-codes/one-webcrypto'
import tweetnacl from 'tweetnacl'
import { checkValidKeyUse, InvalidMaxValue } from './errors.js'
import { CharSize, HashAlg, type Msg } from './types.js'
import {
    RSA_HASHING_ALGORITHM,
    DEFAULT_CHAR_SIZE,
    DEFAULT_HASH_ALGORITHM,
    SALT_LENGTH,
    RSA_ALGORITHM,
    RSA_SIGN_ALG
} from './constants.js'
export { HashAlg }

export enum KeyUse {
    Encrypt = 'encryption',  // encrypt/decrypt
    Sign = 'signing',  // sign
}

export const rsaOperations = {
    verify: async function rsaVerify (
        msg:Msg,
        sig:Msg,
        publicKey:string|CryptoKey,
        charSize:CharSize = DEFAULT_CHAR_SIZE,
        hashAlg:HashAlg = DEFAULT_HASH_ALGORITHM
    ):Promise<boolean> {
        return webcrypto.subtle.verify({
            name: RSA_SIGN_ALG,
            saltLength: SALT_LENGTH
        }, (typeof publicKey === 'string' ?
            await importPublicKey(publicKey, hashAlg, KeyUse.Sign) :
            publicKey),
        normalizeBase64ToBuf(sig),
        normalizeUnicodeToBuf(msg, charSize))
    },

    sign: async function sign (
        msg:Msg,
        privateKey:CryptoKey,
        charSize:CharSize = DEFAULT_CHAR_SIZE
    ):Promise<ArrayBuffer> {
        return webcrypto.subtle.sign(
            { name: RSA_SIGN_ALG, saltLength: SALT_LENGTH },
            privateKey,
            normalizeUnicodeToBuf(msg, charSize)
        )
    },

    encrypt: async function rsaEncrypt (
        msg:Msg,
        publicKey:string|CryptoKey,
        charSize:CharSize = DEFAULT_CHAR_SIZE,
        hashAlg:HashAlg = DEFAULT_HASH_ALGORITHM
    ):Promise<ArrayBuffer> {
        const pubKey = typeof publicKey === 'string' ?
            await importPublicKey(publicKey, hashAlg, KeyUse.Encrypt) :
            publicKey

        return webcrypto.subtle.encrypt(
            { name: RSA_ALGORITHM },
            pubKey,
            normalizeUnicodeToBuf(msg, charSize)
        )
    },

    decrypt: async function rsaDecrypt (
        data:Uint8Array,
        privateKey:CryptoKey|Uint8Array
    ):Promise<Uint8Array> {
        const key = isCryptoKey(privateKey) ?
            privateKey :
            await importRsaKey(privateKey, ['decrypt'])

        const arrayBuffer = await webcrypto.subtle.decrypt(
            { name: RSA_ALGORITHM },
            key,
            data
        )

        const arr = new Uint8Array(arrayBuffer)

        return arr
    }
}

export type VerifyArgs = {
    message: Uint8Array
    publicKey: Uint8Array
    signature: Uint8Array
}

export async function importPublicKey (
    base64Key:string,
    hashAlg:HashAlg,
    use:KeyUse
):Promise<CryptoKey> {
    checkValidKeyUse(use)
    const alg = (use === KeyUse.Encrypt ? RSA_ALGORITHM : RSA_SIGN_ALG)
    const uses:KeyUsage[] = use === KeyUse.Encrypt ?
        ['encrypt'] :
        ['verify']
    const buf = base64ToArrBuf(stripKeyHeader(base64Key))

    return webcrypto.subtle.importKey('spki', buf, {
        name: alg,
        hash: { name: hashAlg }
    }, true, uses)
}

function stripKeyHeader (base64Key:string):string {
    return base64Key
        .replace('-----BEGIN PUBLIC KEY-----\n', '')
        .replace('\n-----END PUBLIC KEY-----', '')
}

/**
 * Using the key type as the record property name (ie. string = key type)
 *
 * The magic bytes are the `code` found in https://github.com/multiformats/multicodec/blob/master/table.csv
 * encoded as a variable integer (more info about that at https://github.com/multiformats/unsigned-varint).
 *
 * The key type is also found in that table.
 * It's the name of the codec minus the `-pub` suffix.
 *
 * Example
 * -------
 * Ed25519 public key
 * Key type: "ed25519"
 * Magic bytes: [ 0xed, 0x01 ]
 */
type KeyTypes = Record<string, {
    magicBytes:Uint8Array
    verify:(args:{
        message: Uint8Array
        publicKey: Uint8Array
        signature: Uint8Array
    }) => Promise<boolean>
}>

export function arrBufToBase64 (buf:ArrayBuffer):string {
    return uint8arrays.toString(new Uint8Array(buf), 'base64pad')
}

export function base64ToArrBuf (string:string):ArrayBuffer {
    return uint8arrays.fromString(string, 'base64pad').buffer
}

export async function sha256 (bytes:Uint8Array):Promise<Uint8Array> {
    return new Uint8Array(await webcrypto.subtle.digest('sha-256', bytes))
}

export const did:{ keyTypes:KeyTypes } = {
    keyTypes: {
        'bls12-381': {
            magicBytes: new Uint8Array([0xea, 0x01]),
            verify: () => { throw new Error('Not implemented') },
        },
        ed25519: {
            magicBytes: new Uint8Array([0xed, 0x01]),
            verify: ed25519Verify,
        },
        rsa: {
            magicBytes: new Uint8Array([0x00, 0xf5, 0x02]),
            verify: rsaVerify,
        },
    }
}

export async function ed25519Verify ({
    message,
    publicKey,
    signature
}:VerifyArgs):Promise<boolean> {
    return tweetnacl.sign.detached.verify(message, signature, publicKey)
}

export async function rsaVerify ({
    message,
    publicKey,
    signature
}:{
    message: Uint8Array
    publicKey: Uint8Array
    signature: Uint8Array
}):Promise<boolean> {
    return rsaOperations.verify(
        message,
        signature,
        await webcrypto.subtle.importKey(
            'spki',
            publicKey,
            { name: RSA_SIGN_ALG, hash: RSA_HASHING_ALGORITHM },
            false,
            ['verify']
        ),
        8
    )
}

export function isCryptoKeyPair (val:unknown):val is CryptoKeyPair {
    return (
        hasProp(val, 'algorithm') &&
        hasProp(val, 'publicKey')
    )
}

export function isCryptoKey (val:unknown):val is CryptoKey {
    return (
        hasProp(val, 'algorithm') &&
        hasProp(val, 'extractable') &&
        hasProp(val, 'type')
    )
}

export function hasProp<K extends PropertyKey> (
    data:unknown,
    prop:K
): data is Record<K, unknown> {
    return (typeof data === 'object' && data != null && prop in data)
}

export const normalizeToBuf = (
    msg:Msg,
    strConv:(str:string)=>ArrayBuffer
):ArrayBuffer => {
    if (typeof msg === 'string') {
        return strConv(msg)
    } else if (typeof msg === 'object' && msg.byteLength !== undefined) {
        // this is the best runtime check I could find for ArrayBuffer/Uint8Array
        const temp = new Uint8Array(msg)
        return temp.buffer
    } else {
        throw new Error('Improper value. Must be a string, ArrayBuffer, Uint8Array')
    }
}

export function normalizeBase64ToBuf (msg:Msg):ArrayBuffer {
    return normalizeToBuf(msg, base64ToArrBuf)
}

export const normalizeUtf8ToBuf = (msg:Msg): ArrayBuffer => {
    return normalizeToBuf(msg, (str) => strToArrBuf(str, CharSize.B8))
}

export const normalizeUtf16ToBuf = (msg:Msg): ArrayBuffer => {
    return normalizeToBuf(msg, (str) => strToArrBuf(str, CharSize.B16))
}

export function normalizeUnicodeToBuf (msg:Msg, charSize:CharSize) {
    switch (charSize) {
        case 8: return normalizeUtf8ToBuf(msg)
        default: return normalizeUtf16ToBuf(msg)
    }
}

export function strToArrBuf (str:string, charSize:CharSize):ArrayBuffer {
    const view = charSize === 8 ?
        new Uint8Array(str.length) :
        new Uint16Array(str.length)

    for (let i = 0, strLen = str.length; i < strLen; i++) {
        view[i] = str.charCodeAt(i)
    }

    return view.buffer
}

export function randomBuf (
    length:number,
    { max }:{ max:number } = { max: 255 }
):ArrayBuffer {
    if (max < 1 || max > 255) {
        throw InvalidMaxValue
    }

    const arr = new Uint8Array(length)

    if (max === 255) {
        webcrypto.getRandomValues(arr)
        return arr.buffer
    }

    let index = 0
    const interval = max + 1
    const divisibleMax = Math.floor(256 / interval) * interval
    const tmp = new Uint8Array(1)

    while (index < arr.length) {
        webcrypto.getRandomValues(tmp)
        if (tmp[0] < divisibleMax) {
            arr[index] = tmp[0] % interval
            index++
        }
    }

    return arr.buffer
}

export function importRsaKey (
    key:Uint8Array,
    keyUsages:KeyUsage[]
):Promise<CryptoKey> {
    return webcrypto.subtle.importKey(
        'spki',
        key,
        { name: RSA_ALGORITHM, hash: RSA_HASHING_ALGORITHM },
        false,
        keyUsages
    )
}

export function joinBufs (fst:ArrayBuffer, snd:ArrayBuffer):ArrayBuffer {
    const view1 = new Uint8Array(fst)
    const view2 = new Uint8Array(snd)
    const joined = new Uint8Array(view1.length + view2.length)
    joined.set(view1)
    joined.set(view2, view1.length)
    return joined.buffer
}
