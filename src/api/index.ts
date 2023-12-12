import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { get, post } from '@/utils/request'
import { useAuthStore, useSettingStore } from '@/store'

export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>({
    url: '/chat',
    data: { prompt, options },
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

export function fetchUpdateUser(userId: number, userName: string, headImageUrl: string | null | undefined) {
  return post<boolean>({
    url: '/api/v1/User/UpdateUser',
    data: { userId, userName, headImageUrl },
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    prompt: string
    // 会话ID
    conversationId: number | null
    model: string
    modelType: number
    contextCount: number | null
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
    contextCount: params.contextCount,
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
      'Accept': 'application/octet-stream',
      'Content-Type': 'application/json',
    },
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
    data: { token },
  })
}

export function fetchEmailCode(userEmail: string) {
  return post<boolean>({
    url: '/api/v1/Email/CreateCheckCode',
    data: { userEmail },
  })
}

export function fetchRegister(userAccount: string, userPassword: string, repeatPassword: string, checkCode: string) {
  return post<string>({
    url: '/api/v1/Login/Register',
    data: { userAccount, userPassword, repeatPassword, checkCode },
  })
}

export function generateImage<T>(Prompt: string, modelType: number, connectionId: any, Count: number, Size: number) {
  return post<T>({
    url: '/api/v1/Image/GenerateGraph',
    data: { Prompt, Count, modelType, connectionId, Size },
  })
}

interface LoginRes {
  refreshToken: string
  token: string
}

export function login(data: { userAccount: string; userPassword: string }) {
  return post<LoginRes>({
    url: '/api/v1/Login/Login',
    data,
  })
}

interface PagedRes<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
export interface ImageRes {
  imageRecordId: number
  prompt: string | null
  pranslatePrompt: string | null
  imagUrl: string
  forwardCount: number
  collectCount: number
  likeCount: number
  createDate: Date
  isPublic: boolean | null
  isForward: boolean | null
  isCollect: boolean | null
  islike: boolean | null
}
export function MyImageList(queryString: string | null, pageIndex: number, pageSize: number) {
  return post<PagedRes<ImageRes>>({
    url: '/api/v1/Image/MyImageList',
    data: { queryString, pageIndex, pageSize },
  })
}
/**
 * 共享图片
 * @param imageRecordId
 * @param isPublic
 * @returns
 */
export function ShareImage(imageRecordId: number, isPublic: boolean) {
  return get<boolean>({
    url: '/api/v1/Image/ShareImage',
    data: { imageRecordId, isPublic },
  })
}
/**
 * 图片广场
 * @param queryString
 * @param pageIndex
 * @param pageSize
 * @returns
 */
export function ShareImageList(queryString: string | null, pageIndex: number, pageSize: number) {
  return post<PagedRes<ImageRes>>({
    url: '/api/v1/Image/ShareImageList',
    data: { queryString, pageIndex, pageSize },
  })
}

export interface SubmitDTO {
  negativePrompt: string
  Prompt: string
  model: string
  connectionId: any
  Count: number
  Size: number
}

export function GenerateGraph(submitDTO: SubmitDTO) {
  return post<string>({
    url: '/api/v1/Image/GenerateGraph',
    data: submitDTO,
  })
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  discount: number
  categoryId: number
  stock: number | null
  categoryName: string
  isVIP: boolean | null
  vipLevel: number | null
  vipTime: number | null
  imagePath: string | null | undefined
}
/**
 * 商品列表
 * @returns
 */
export function GetAllProductList() {
  return get<Product[]>({
    url: '/api/v1/Product/GetAllProductList',
    data: null,
  })
}

export interface AlipayResponse {
  out_trade_no: string
  qr_code: string
}
/** 商品购买 */
export function PreCreate(Name: string, Price: number, Description: string, ProductId: number, isvip: boolean | null, vipLevel: number | null, vipTime: number | null) {
  return post<AlipayResponse>({
    url: '/api/v1/AliPay/PreCreate',
    data: { Name, Price, Description, isvip, vipLevel, vipTime, ProductId },
  })
}

export interface PromptOptionRes {
  promptId: number
  act: string
  prompt: string
  usedCount: number
}
/** 分页系统提示词列表 */
export function PromptOptionList(PageIndex: number, PageSize: number, QueryString: string | null) {
  return post<PagedRes<PromptOptionRes>>({
    url: '/api/v1/Chat/PromptOptionList',
    data: { PageSize, PageIndex, QueryString },
  })
}

/** 全部系统提示词列表 */
export function AllPromptOptionList() {
  return get<PromptOptionRes[]>({
    url: '/api/v1/Chat/AllPromptOptionList',
  })
}

export interface ChatConversationRes {
  conversationId: number
  conversationName: string
  isEdit: boolean
}
/** 聊天会话列表 */
export function ChatConversationList(PageIndex: number, PageSize: number, QueryString: string | null) {
  return post<PagedRes<ChatConversationRes>>({
    url: '/api/v1/Chat/ChatConversationList',
    data: { PageSize, PageIndex, QueryString },
  })
}

export interface ChatRes {
  chatRecordId: number
  modelType: string
  model: string
  conversationId: number
  message: string
  createDate: string
  modifyDate: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  role: string
  error?: boolean
  loading?: boolean
}
/** 聊天列表 */
export function ChatRecordList(PageIndex: number, PageSize: number, ConversationId: number | null, QueryString: string | null) {
  return post<PagedRes<ChatRes>>({
    url: '/api/v1/Chat/ChatRecordList',
    data: { PageSize, PageIndex, ConversationId, QueryString },
  })
}

/**
 * 删除聊天会话
 * @param conversationId
 * @constructor
 */
export function DeleteChatConversation(conversationId: number) {
  return get<boolean>({
    url: '/api/v1/Chat/DeleteChatConversation',
    data: { conversationId },
  })
}
/**
 * 修改聊天会话
 * @param conversationId
 * @constructor
 */
export function ChangeChatConversation(conversationId: number, conversationName: string) {
  return get<boolean>({
    url: '/api/v1/Chat/ChangeChatConversation',
    data: { conversationId, conversationName },
  })
}
/**
 * 新建聊天会话
 * @param conversationId
 * @constructor
 */
export function AddChatConversation(conversationName: string) {
  return get<ChatConversationRes>({
    url: '/api/v1/Chat/AddChatConversation',
    data: { conversationName },
  })
}
/**
 * 删除聊天记录
 * @param conversationId
 * @constructor
 */
export function DeleteChatRecord(recordId: number) {
  return get<boolean>({
    url: '/api/v1/Chat/DeleteChatRecord',
    data: { recordId },
  })
}
/**
 * 修改密码
 * @param userAccount
 * @param userPassword
 * @param repeatPassword
 * @param checkCode
 */
export function fetchChangePassword(userAccount: string, userPassword: string, repeatPassword: string, checkCode: string) {
  return post<string>({
    url: '/api/v1/Login/ChangePassword',
    data: { userAccount, userPassword, repeatPassword, checkCode },
  })
}
