<script setup lang='ts'>
import {computed, onMounted, onUnmounted, ref} from 'vue'
import {useRoute} from 'vue-router'
import {storeToRefs} from 'pinia'
import {NButton, NForm, NFormItem, NInput, NModal, NPopselect, useDialog, useMessage,NPopover} from 'naive-ui'
import {Message} from './components'
import {useScroll} from './hooks/useScroll'
import {useChat} from './hooks/useChat'
import {useCopyCode} from './hooks/useCopyCode'
import {useUsingContext} from './hooks/useUsingContext'
import HeaderComponent from './components/Header/index.vue'
import {HoverButton, SvgIcon} from '@/components/common'
import {useBasicLayout} from '@/hooks/useBasicLayout'
import {useChatStore, usePromptStore} from '@/store'
import {fetchChatAPIProcess} from '@/api'
import {t} from '@/locales'
import SubmitFooter from '@/components/common/SubmitFooter/submitFooter.vue'
import {downloadHtml2Canvas} from "@/views/chat/hooks/useHtml2Canvas";
// 使用复制code
useCopyCode()
// 添加请求终断对象

const controller = ref(new AbortController())
const ganNewController = () => {
	controller.value = new AbortController()
	return controller.value
}
const openLongReply = import.meta.env.VITE_GLOB_OPEN_LONG_REPLY === 'true'
const route = useRoute()
const dialog = useDialog()
const ms = useMessage()
const chatStore = useChatStore()
// 添加PromptStore
const promptStore = usePromptStore()


const {isMobile} = useBasicLayout()
const {addChat, updateChat, updateChatSome, getChatByUuidAndIndex} = useChat()
const {scrollRef, scrollToBottom, scrollToBottomIfAtBottom} = useScroll()
const {usingContext, toggleUsingContext} = useUsingContext()

const {uuid} = route.params as { uuid: string }
// 从存储中取出对应聊天数据 uuid 标识
const dataSources = computed(() => chatStore.getChatByUuid(+uuid))
const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !!item.conversationOptions)))

const prompt = ref<string>('')
const modelType = ref<string>('gpt-3.5-turbo')
const loading = ref<boolean>(false)
const showModal = ref(false)

const modelOptions: Array<{ label: string; value: string; length: number }> = [
	{label: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo', length: 2000},
	{label: 'gpt-3.5-turbo-16k(会员专属)', value: 'gpt-3.5-turbo-16k', length: 4000},
	{label: 'gpt-4(会员专属)', value: 'gpt-4', length: 4000},
]
// 计算每一种模式下可以输入的字符数
const submitFooterInputCounter = computed(() => modelOptions.find(i => i.value === modelType.value)?.length || 0)

// 使用storeToRefs，保证store修改后，联想部分能够重新渲染
const {promptList: promptTemplate} = storeToRefs<any>(promptStore)
// 2023.4.10 添加上下文
let lastOptions: Chat.ConversationRequest = {}
// 未知原因刷新页面，loading 状态不会重置，手动重置
dataSources.value.forEach((item, index) => {
	if (item.conversationOptions?.conversationId != null)
		lastOptions = item.conversationOptions
	if (item.loading)
		updateChatSome(+uuid, index, {loading: false})
})

// 发起对话
async function onConversation() {
	let message = prompt.value
	// 防止二次点击按钮重复发起
	if (loading.value) return
	if (!message || message.trim() === '') return
	// 添加用户输出聊天记录
	addChat(
		+uuid,
		{
			dateTime: new Date().toLocaleString(),
			text: message,
			inversion: true, // 用户询问
			error: false,
			conversationOptions: null,
			requestOptions: {prompt: message, options: null},
		},
	)


	// 2023.4.10 添加上下文
	// let options: Chat.ConversationRequest = {}
	let options: Chat.ConversationRequest = lastOptions
	const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions

	if (lastContext && usingContext.value) {
		options = {...lastContext}
	}


	loading.value = true
	prompt.value = ''


	addChat(
		+uuid,
		{
			dateTime: new Date().toLocaleString(),
			text: '',
			loading: true,
			inversion: false, // gpt 回答
			error: false,
			conversationOptions: null,
			requestOptions: {prompt: message, options: {...options}},
		},
	)
	scrollToBottom()

	try {
		let lastText = ''
		const fetchChatAPIOnce = async () => {
			await fetchChatAPIProcess<string>({
				conversationId: options.conversationId,
				model: modelType.value,
				modelType: 0,
				prompt: message,
				contextCount:usingContext.value==false?0:null,
				// 传入signal 代表此请求可控
				signal: ganNewController().signal,
				onDownloadProgress: ({event}) => {
					const xhr = event.target
					const {responseText} = xhr
					// Always process the final line
					const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
					let chunk = responseText
					if (lastIndex !== -1)
						chunk = responseText.substring(lastIndex)
					try {
						const {data} = JSON.parse(chunk)
						updateChat(
							+uuid,
							dataSources.value.length - 1,
							{
								dateTime: new Date().toLocaleString(),
								text: lastText + (data.Message ?? ''),
								inversion: false,
								error: false,
								loading: true,
								conversationOptions: {conversationId: data.ConversationId, parentMessageId: data.ChatRecordId},
								requestOptions: {prompt: message, options: {...options}},
							},
						)
						// 2023.4.10 添加上下文
						if (data.ConversationId != null && data.ConversationId.length !== 0)
							lastOptions = {conversationId: data.ConversationId, parentMessageId: data.ChatRecordId}

						if (openLongReply && data.detail.choices[0].finish_reason === 'length') {
							options.parentMessageId = data.ChatRecordId
							lastText = data.Message
							message = ''
							return fetchChatAPIOnce()
						}

						scrollToBottomIfAtBottom()
					} catch (error) {
						//
					}
				},
			})
			// 重置当前条目的loading状态
			updateChatSome(+uuid, dataSources.value.length - 1, {loading: false})
		}
		await fetchChatAPIOnce()
	} catch (error: any) {
		// 测试webapi
		const errorMessage = error?.message ?? ''
		if (error.message === 'canceled') {
			updateChatSome(
				+uuid,
				dataSources.value.length - 1,
				{
					loading: false,
				},
			)
			scrollToBottomIfAtBottom()
			return
		}
		const currentChat = getChatByUuidAndIndex(+uuid, dataSources.value.length - 1)
		//
		if (currentChat && currentChat?.text && currentChat!.text !== '') {
			updateChatSome(
				+uuid,
				dataSources.value.length - 1,
				{
					text: `${currentChat!.text}\n[${errorMessage}]`,
					error: false,
					loading: false,
				},
			)
			return
		}
		// 添加失败响应
		updateChat(
			+uuid,
			dataSources.value.length - 1,
			{
				dateTime: new Date().toLocaleString(),
				text: errorMessage,
				inversion: false,
				error: true,
				loading: false,
				conversationOptions: null,
				requestOptions: {prompt: message, options: {...options}},
			},
		)
		scrollToBottomIfAtBottom()
	} finally {
		loading.value = false
	}
}

async function onRegenerate(index: number) {
	if (loading.value)
		return


	const {requestOptions} = dataSources.value[index]

	let message = requestOptions?.prompt ?? ''

	let options: Chat.ConversationRequest = {}

	if (requestOptions.options)
		options = {...requestOptions.options}

	loading.value = true

	updateChat(
		+uuid,
		index,
		{
			dateTime: new Date().toLocaleString(),
			text: '',
			inversion: false,
			error: false,
			loading: true,
			conversationOptions: null,
			requestOptions: {prompt: message, options: {...options}},
		},
	)

	try {
		let lastText = ''
		const fetchChatAPIOnce = async () => {
			await fetchChatAPIProcess<Chat.ConversationResponse>({
				prompt: message,
				conversationId: options.conversationId,
				model: 'gpt-3.5-turbo',
				modelType: 0,
				contextCount:usingContext.value==false?0:null,
				signal: ganNewController().signal,
				onDownloadProgress: ({event}) => {
					const xhr = event.target
					const {responseText} = xhr

					// Always process the final line
					const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
					let chunk = responseText
					if (lastIndex !== -1)
						chunk = responseText.substring(lastIndex)
					try {
						const data = JSON.parse(chunk)
						updateChat(
							+uuid,
							index,
							{
								dateTime: new Date().toLocaleString(),
								text: lastText + (data.text ?? ''),
								inversion: false,
								error: false,
								loading: true,
								conversationOptions: {conversationId: data.conversationId, parentMessageId: data.id},
								requestOptions: {prompt: message, options: {...options}},
							},
						)

						if (openLongReply && data.detail.choices[0].finish_reason === 'length') {
							options.parentMessageId = data.id
							lastText = data.text
							message = ''
							return fetchChatAPIOnce()
						}
					} catch (error) {
						//
					}
				},
			})
			updateChatSome(+uuid, index, {loading: false})
		}
		await fetchChatAPIOnce()
	} catch (error: any) {
		if (error.message === 'canceled') {
			updateChatSome(
				+uuid,
				index,
				{
					loading: false,
				},
			)
			return
		}

		const errorMessage = error?.message ?? t('common.wrong')

		updateChat(
			+uuid,
			index,
			{
				dateTime: new Date().toLocaleString(),
				text: errorMessage,
				inversion: false,
				error: true,
				loading: false,
				conversationOptions: null,
				requestOptions: {prompt: message, options: {...options}},
			},
		)
	} finally {
		loading.value = false
	}
}

// 点击导出图片
function handleExport() {
	if (loading.value)
		return
	const d = dialog.warning({
		title: t('chat.exportImage'),
		content: t('chat.exportImageConfirm'),
		positiveText: t('common.yes'),
		negativeText: t('common.no'),
		onPositiveClick: async () => {
			try {
				d.loading = true
				await downloadHtml2Canvas(document.getElementById('image-wrapper') as HTMLElement, {useCORS: true})
				d.loading = false
				ms.success(t('chat.exportSuccess'))
				Promise.resolve()
			} catch (error: any) {
				ms.error(t('chat.exportFailed'))
			} finally {
				d.loading = false
			}
		},
	})
}

// 点击删除指定记录
function handleDelete(index: number) {
	if (loading.value)
		return

	dialog.warning({
		title: t('chat.deleteMessage'),
		content: t('chat.deleteMessageConfirm'),
		positiveText: t('common.yes'),
		negativeText: t('common.no'),
		onPositiveClick: () => {
			chatStore.deleteChatByUuid(+uuid, index)
		},
	})
}

// 删除所有记录
function handleClear() {
	if (loading.value)
		return

	dialog.warning({
		title: t('chat.clearChat'),
		content: t('chat.clearChatConfirm'),
		positiveText: t('common.yes'),
		negativeText: t('common.no'),
		onPositiveClick: () => {
			chatStore.clearChatByUuid(+uuid)
		},
	})
}

// 结束请求
function handleStop() {
	if (loading.value) {
		controller.value.abort()
		loading.value = false
	}
}

// 可优化部分
// 搜索选项计算，这里使用value作为索引项，所以当出现重复value时渲染异常(多项同时出现选中效果)
// 理想状态下其实应该是key作为索引项,但官方的renderOption会出现问题，所以就需要value反renderLabel实现
const searchOptions = computed(() => {
	if (prompt.value.startsWith('/')) {
		return promptTemplate.value.filter((item: { key: string }) => item.key.toLowerCase().includes(prompt.value.substring(1).toLowerCase())).map((obj: { value: any }) => {
			return {
				label: obj.value,
				value: obj.value,
			}
		})
	} else {
		return []
	}
})

// value反渲染key
const renderOption = (option: { label: string }) => {
	for (const i of promptTemplate.value) {
		if (i.value === option.label)
			return [i.key]
	}
	return []
}

const buttonDisabled = computed(() => {
	return loading.value || !prompt.value || prompt.value.trim() === ''
})

onMounted(() => {
	scrollToBottom()
})

onUnmounted(() => {
	if (loading.value)
		controller.value.abort()
})
</script>

<template>
	<div class="flex flex-col w-full h-full">
		<HeaderComponent
			v-if="isMobile"
			:using-context="usingContext"
			@export="handleExport"
			@toggle-using-context="toggleUsingContext"
		/>
		<main class="flex-1 overflow-hidden">
			<div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
				<div
					id="image-wrapper"
					class="w-full max-w-screen-xl m-auto dark:bg-[#101014]"
					:class="[isMobile ? 'p-2' : 'p-4']"
				>
					<template v-if="!dataSources.length">
						<div class="flex items-center justify-center mt-4 text-center text-neutral-300">
							<SvgIcon icon="ri:bubble-chart-fill" class="mr-2 text-3xl"/>
							<span>QQ群：814880639 </span>
						</div>
						<div class="flex items-center justify-center mt-4 text-center text-neutral-300">
							<span>方便获取第一手更新说明和优惠信息</span>
						</div>
					</template>
					<template v-else>
						<div>
							<Message
								v-for="(item, index) of dataSources"
								:key="index"
								:date-time="item.dateTime"
								:text="item.text"
								:inversion="item.inversion"
								:error="item.error"
								:loading="item.loading"
								@regenerate="onRegenerate(index)"
								@delete="handleDelete(index)"
							/>
							<div class="sticky bottom-0 left-0 flex justify-center">
								<NButton v-if="loading" type="warning" @click="handleStop">
									<template #icon>
										<SvgIcon icon="ri:stop-circle-line"/>
									</template>
									Stop Responding
								</NButton>
							</div>
						</div>
					</template>
				</div>
			</div>
		</main>
		<SubmitFooter
			v-model="prompt"
			show-token
			:search-options="searchOptions"
			:render-option="renderOption"
			:button-disabled="buttonDisabled"
			:counter="submitFooterInputCounter"
			@submit="onConversation"
		>
		<HoverButton v-if="!isMobile" @click="showModal = true">
				<span class="text-xl text-[#4f555e] dark:text-white">
						<NPopover trigger="hover">
							<template #trigger>
								<SvgIcon class="text-2xl cursor-pointer" icon="ri:file-user-line"/>
							</template>
							<span>聊天设置</span>
						</NPopover>
					</span>
			</HoverButton>
			<HoverButton @click="handleClear">
        <span class="text-xl text-[#4f555e] dark:text-white">
          <SvgIcon icon="ri:delete-bin-line"/>
        </span>
			</HoverButton>
			<HoverButton v-if="!isMobile" @click="handleExport">
        <span class="text-xl text-[#4f555e] dark:text-white">
          <SvgIcon icon="ri:download-2-line"/>
        </span>
			</HoverButton>
			<HoverButton v-if="!isMobile" @click="toggleUsingContext">
				<span class="text-xl" :class="{ 'text-[#4b9e5f]': usingContext, 'text-[#a8071a]': !usingContext }">
						<NPopover trigger="hover">
							<template #trigger>
								<SvgIcon icon="ri:chat-history-line"/>
							</template>
							<span>是否包含上文</span>
						</NPopover>
					</span>
			</HoverButton>
		</SubmitFooter>
		<NModal v-model:show="showModal" style="width: 90%; max-width: 600px;" preset="card" >
			<NForm
				ref="formRef"
				label-placement="left"
				label-width="auto"
				require-mark-placement="right-hanging"
			>
				<NFormItem label="系统提示词" path="verifycationCode">
					<NInput/>
				</NFormItem>
				<NFormItem label="模型选择">
					<NPopselect
						v-model:value="modelType" :options="modelOptions" trigger="click"
						:on-update:value="(value) => modelType = value"
					>
						<NButton>{{ modelOptions.find(i => i.value === modelType)?.label || '请选择模型' }}</NButton>
					</NPopselect>
				</NFormItem>
			</NForm>
		</NModal>
	</div>
</template>
