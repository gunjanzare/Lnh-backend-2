import { decrypt } from './crypto'

export const decodeSessionUserInfo = (token: string): any => {
    return decrypt(token)
}
