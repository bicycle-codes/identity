import { z } from 'zod'

export const did = z.custom<`did:key:z${string}`>(val => {
    return typeof val === 'string' ?
        val.startsWith('did:key:z') :
        false
})

export const device = z.object({
    aes: z.string(),
    did: did,
    exchange: z.string(),
    name: z.string()
})

export const devices = z.record(z.string(), device)

export const Identity = z.object({
    username: z.string(),
    humanName: z.string(),
    rootDid: did,
    devices
})
