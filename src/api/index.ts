import type {AxiosProgressEvent, GenericAbortSignal} from 'axios'
import {post, get} from '@/utils/request'
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

export function fetchGetUser<T = any>() {
	return get<T>({
		url: '/api/v1/User/GetUser',
	})
}

export function fetchChatAPIProcess<T = any>(
	params: {
		prompt: string
		// 会话ID
		conversationId?: number
		model: string
		modelType: number,
		contextCount:number|null,
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
		contextCount:params.contextCount,
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
		url: '/api/v1/Chat/ChatCompletionStream',
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
		url: '/api/v1/Email/CreateCheckCode',
		data: {userEmail},
	})
}

export function fetchRegister(userAccount: string, userPassword: string, repeatPassword: string, checkCode: string) {
	return post<string>({
		url: '/api/v1/Login/Register',
		data: {userAccount, userPassword, repeatPassword, checkCode},
	})
}


export function generateImage<T>(Prompt: string,
																 modelType: number,
																 connectionId: any,
																 Count: number,
																 Size: number) {
	return post<T>({
		url: '/api/v1/Image/GenerateGraph',
		data: {Prompt, Count, modelType, connectionId, Size},
	})
}


type LoginRes = {
	refreshToken: string
	token: string
}

export function login(data: { userAccount: string, userPassword: string }) {
	return post<LoginRes>({
		url: '/api/v1/Login/Login',
		data,
	})
}

type PagedRes<T> = {
	items:T[]
	total: number
	page: number
	pageSize: number
}
export type ImageRes={
	imageRecordId:number
	prompt:string|null
	pranslatePrompt:string|null
	imagUrl:string
	forwardCount:number
	collectCount:number
	likeCount:number
	createDate:Date
	isPublic:boolean|null
}
export function MyImageList(queryString: string |null, pageIndex: number, pageSize: number) {
	return post<PagedRes<ImageRes>>({
		url: '/api/v1/Image/MyImageList',
		data:{queryString,pageIndex,pageSize},
	})
}
/**
 * 共享图片
 * @param imageRecordId 
 * @param isPublic 
 * @returns 
 */
export function ShareImage(imageRecordId: number,isPublic: boolean){
	return get<boolean>({
		url:'/api/v1/Image/ShareImage',
		data:{imageRecordId,isPublic}
	})
}
/**
 * 图片广场
 * @param queryString 
 * @param pageIndex 
 * @param pageSize 
 * @returns 
 */
export function ShareImageList(queryString: string |null, pageIndex: number, pageSize: number){
	return post<PagedRes<ImageRes>>({
		url:'/api/v1/Image/ShareImageList',
		data:{queryString,pageIndex,pageSize},
	})
}

export type SubmitDTO = {
	negativePrompt: string
	Prompt: string
	modelType: number
	connectionId: any
	Count: number
	Size: number,
	model: string | null
}

export function GenerateGraph(submitDTO: SubmitDTO){
	return post<string>({
		url:'/api/v1/Image/GenerateGraph',
		data:submitDTO
	})
}
