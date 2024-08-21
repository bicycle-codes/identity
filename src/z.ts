import { z } from 'zod'

export const did = z.custom<`did:key:z${string}`>(val => {
    return typeof val === 'string' ?
        val.startsWith('did:key:z') :
        false
})

export const device = z.object({
    humanReadableName: z.string(),
    name: z.string(),
    did,
    aes: z.string(),
    encryptionKey: z.string()
})

export const devices = z.record(z.string(), device)

export const SerializedIdentity = z.object({
    humanName: z.string(),
    username: z.string(),
    DID: did,
    rootDID: did,
    devices: z.record(z.string(), z.string()),
    storage: z.object({
        encryptionKeyName: z.string(),
        signingKeyName: z.string()
    })
})
