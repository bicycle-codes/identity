import { KeyUse } from './util'
const InvalidKeyUse = new Error("Invalid key use. Please use 'exchange' or 'write")
export const InvalidMaxValue = new Error('Max must be less than 256 and greater than 0')

export function checkValidKeyUse (use:KeyUse):void {
    checkValid(use, [KeyUse.Exchange, KeyUse.Write], InvalidKeyUse)
}

function checkValid<T> (toCheck: T, opts: T[], error: Error): void {
    const match = opts.some(opt => opt === toCheck)
    if (!match) {
        throw error
    }
}