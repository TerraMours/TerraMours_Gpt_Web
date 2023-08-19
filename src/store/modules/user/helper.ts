import {ss} from '@/utils/storage'

const LOCAL_NAME = 'userStorage'

export interface UserInfo {
	description: string
	userName?: string// 用户名
	roleId?: number// 角色
	headImageUrl?: string//头像url
	vipLevel?: string//vip等级
	vipExpireTime?: string//vip过期时间
	imageCount?: string//剩余图片使用次数
	userAccount?: string//账号（用于记住密码选项）
	userPassword?: string // 密码 （用于记住密码选项）
	balance?: number//用户余额
}

export interface UserState {
	userInfo: UserInfo
}

export function defaultSetting(): UserState {
	return {
		userInfo: {
			headImageUrl: 'https://avatars.githubusercontent.com/u/43564692?s=96&v=4',
			userName: 'terramours',
			description: '最新gpt地址： <a href="https://ai.terramours.site/" class="text-blue-500" target="_blank" >ai.terramours.site</a>',
		},
	}
}

export function getLocalState(): UserState {
	const localSetting: UserState | undefined = ss.get(LOCAL_NAME)
	return {...defaultSetting(), ...localSetting}
}

export function setLocalState(setting: UserState): void {
	ss.set(LOCAL_NAME, setting)
}
