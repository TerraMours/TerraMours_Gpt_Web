import { ss } from '@/utils/storage'

const LOCAL_NAME = 'SECRET_TOKEN'
const LOCAL_IMG_NAME = 'IMG_KEY'
export function getToken() {
  return ss.get(LOCAL_NAME)
}

export function setToken(token: string) {
  return ss.set(LOCAL_NAME, token)
}

export function removeToken() {
  return ss.remove(LOCAL_NAME)
}

export function getImgKey() {
  return ss.get(LOCAL_IMG_NAME)
}

export function setImgKey(imgKey: string) {
  return ss.set(LOCAL_IMG_NAME, imgKey)
}

export function removeImgKey() {
  return ss.remove(LOCAL_IMG_NAME)
}
