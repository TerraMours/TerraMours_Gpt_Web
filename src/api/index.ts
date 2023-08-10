import type {AxiosProgressEvent, GenericAbortSignal} from 'axios'
import {post, get} from '@/utils/request'
import {useAuthStore, useSettingStore} from '@/store'
import { type } from 'os';

export function fetchChatAPI<T = any>(
	prompt: string,
	options?: { conversationId?: string; parentMessageId?: string },
	signal?: GenericAbortSignal,
) {
	return post<T>({
		url: '/chat',
		data: {prompt, options},
		signal,
	})
}

export function fetchChatConfig<T = any>() {
	return post<T>({
		url: '/config',
	})
}

export function fetchGetUser<T = any>() {
	return get<T>({
		url: '/v1/User/GetUser',
	})
}

export function fetchChatAPIProcess<T = any>(
	params: {
		prompt: string
		// 会话ID
		conversationId?: number
		model: string
		modelType: number
		// options?: { conversationId?: string; parentMessageId?: string }
		signal?: GenericAbortSignal
		onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void
	},
) {
	const settingStore = useSettingStore()
	const authStore = useAuthStore()
	let data: Record<string, any> = {
		prompt: params.prompt,
		conversationId: params.conversationId,
		model: params.model,
		modelType: params.modelType,
		systemMessage: settingStore.systemMessage || '',
	}

	if (authStore.isChatGPTAPI) {
		data = {
			...data,
			systemMessage: settingStore.systemMessage,
			temperature: settingStore.temperature,
			top_p: settingStore.top_p,
		}
	}

	return post<T>({
		url: '/v1/Chat/ChatCompletionStream',
		data,
		signal: params.signal,
		onDownloadProgress: params.onDownloadProgress,
		headers: {
			'Accept': "application/octet-stream",
			"Content-Type": "application/json"
		}
	})
}

export function fetchSession<T>() {
	return post<T>({
		url: '/session',
	})
}

export function fetchVerify<T>(token: string) {
	return post<T>({
		url: '/verify',
		data: {token},
	})
}

export function fetchEmailCode(userEmail: string) {
	return post<boolean>({
		url: '/v1/Email/CreateCheckCode',
		data: {userEmail},
	})
}

export function fetchRegister(userAccount: string, userPassword: string, repeatPassword: string, checkCode: string) {
	return post<string>({
		url: '/v1/Login/Register',
		data: {userAccount, userPassword, repeatPassword, checkCode},
	})
}


export function generateImage<T>(Prompt: string,
																 modelType: number,
																 connectionId: any,
																 Count: number,
																 Size: number) {
	return post<T>({
		url: '/v1/Image/GenerateGraph',
		data: {Prompt, Count, modelType, connectionId, Size},
	})
}


type LoginRes = {
	refreshToken: string
	token: string
}

export function login(data: { userAccount: string, userPassword: string }) {
	return post<LoginRes>({
		url: '/v1/Login/Login',
		data,
	})
}

type PagedRes<T> = {
	items:T[]
	total: string
	page: number
	pageSize: number
}
type ImageRes={
	imageRecordId:number
	prompt:string|null
	pranslatePrompt:string|null
	imagUrl:string
	forwardCount:number
	collectCount:number
	likeCount:number
	createDate:Date
}
export function MyImageList(queryString: string |null, pageIndex: number, pageSize: number) {
	return post<PagedRes<ImageRes>>({
		url: '/v1/Image/MyImageList',
		data:{queryString,pageIndex,pageSize},
	})
}
