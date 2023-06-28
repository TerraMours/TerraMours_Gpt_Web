import type {AxiosProgressEvent, GenericAbortSignal} from 'axios'
import {post} from '@/utils/request'
import {useAuthStore, useSettingStore} from '@/store'

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

export function fetchChatAPIProcess<T = any>(
	params: {
		prompt: string
		// 会话ID
		conversationId: number
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
		// conversationId: params.conversationId,
		// model: params.model,
		// modelType: params.modelType,
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
		url: '/v1/Chat/ChatStream1',
		data,
		signal: params.signal,
		onDownloadProgress: params.onDownloadProgress,
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
