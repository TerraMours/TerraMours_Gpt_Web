<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { NButton, NForm, NFormItem, NInput, NModal, NPopover, NPopselect, useDialog, useMessage } from 'naive-ui'
import { Message } from './components'
import { useScroll } from './hooks/useScroll'
import { useCopyCode } from './hooks/useCopyCode'
import { useUsingContext } from './hooks/useUsingContext'
import HeaderComponent from './components/Header/index.vue'
import { HoverButton, SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useChatStore, usePromptStore } from '@/store'
import type { ChatRes } from '@/api'
import { ChatRecordList, DeleteChatRecord, fetchChatAPIProcess } from '@/api'
import { t } from '@/locales'
import SubmitFooter from '@/components/common/SubmitFooter/submitFooter.vue'
import { downloadHtml2Canvas } from '@/views/chat/hooks/useHtml2Canvas'
// 使用复制code
useCopyCode()
// 添加请求终断对象
const controller = ref(new AbortController())
const ganNewController = () => {
  controller.value = new AbortController()
  return controller.value
}
const dialog = useDialog()
const ms = useMessage()
const chatStore = useChatStore()
// 添加PromptStore
const promptStore = usePromptStore()

const { isMobile } = useBasicLayout()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()
const { usingContext, toggleUsingContext } = useUsingContext()

// new
const page = ref(1)
const pageSize = ref(10)
const chatRecords = ref<ChatRes[]>([])

onMounted(async () => {
  if (scrollRef.value)
    scrollRef.value.addEventListener('scroll', handleScroll)

  setTimeout(async () => {
    const { data } = await ChatRecordList(page.value, pageSize.value, chatStore.active, null)
    if (data.items != null)
      chatRecords.value = data.items
  }, 500) // 延迟500毫秒（0.5秒）执行
})
function handleScroll(event: Event) {
  const target = event.target as HTMLElement
  if (target.scrollTop === 0)
    slideLoading()
}
/**
 *  滑动加载
 */
async function slideLoading() {
  const { data } = await ChatRecordList(page.value + 1, pageSize.value, chatStore.active, null)
  if (data.items != null && data.items.length > 0) {
    chatRecords.value = [...data.items, ...chatRecords.value]
    page.value = page.value + 1
  }
}

const prompt = ref<string>('')
const modelType = ref<string>('gpt-3.5-turbo')
const loading = ref<boolean>(false)
const showModal = ref(false)

const modelOptions: Array<{ label: string; value: string; length: number }> = [
  { label: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo', length: 2000 },
  { label: 'gpt-3.5-turbo-16k(会员专属)', value: 'gpt-3.5-turbo-16k', length: 4000 },
  { label: 'gpt-4(余额计费)', value: 'gpt-4', length: 4000 },
]
// 计算每一种模式下可以输入的字符数
const submitFooterInputCounter = computed(() => modelOptions.find(i => i.value === modelType.value)?.length || 0)

// 使用storeToRefs，保证store修改后，联想部分能够重新渲染
const { promptList: promptTemplate } = storeToRefs<any>(promptStore)

// 发起对话
async function ChatConversation() {
  try {
    const message = prompt.value
    // 防止二次点击按钮重复发起
    if (loading.value)
      return
    if (!message || message.trim() === '')
      return
    const askRecord: ChatRes = {
      message,
      createDate: new Date().toLocaleString(),
      role: 'user',
      error: false,
      chatRecordId: 0,
      modelType: '',
      model: '',
      conversationId: 0,
      modifyDate: '',
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    }
    // 添加用户输出聊天记录
    chatRecords.value.push(askRecord)
    const newRecord: ChatRes = {
      message: '',
      createDate: new Date().toLocaleString(),
      role: 'assistant',
      error: false,
      loading: false,
      chatRecordId: 0,
      modelType: '',
      model: '',
      conversationId: 0,
      modifyDate: '',
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    }
    chatRecords.value.push(newRecord)
    // 发起新会话拉到最底部
    scrollToBottom()
    loading.value = true
    // 调用接口后更新内容
    const index = chatRecords.value.length - 1
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<string>({
        conversationId: chatStore.active,
        model: modelType.value,
        modelType: 0,
        prompt: message,
        contextCount: !usingContext.value ? 0 : null,
        // 传入signal 代表此请求可控
        signal: ganNewController().signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1)
            chunk = responseText.substring(lastIndex)
          try {
            const resdata = JSON.parse(chunk)
            if (resdata.code !== 200) {
              chatRecords.value[index].message = resdata.message
              chatRecords.value[index].loading = false
            }
            else {
              chatRecords.value[index].loading = true
              // 更新新增记录的message字段的值
              chatRecords.value[index].message = resdata.data.Message ?? ''
              if (chatStore.active === 0)
                chatStore.active = resdata.data.ConversationId
            }
            scrollToBottomIfAtBottom()
          }
          catch (error: any) {
            chatRecords.value[index].message = error.toString()
            chatRecords.value[index].loading = false
          }
        },
      })
      // 重置当前条目的loading状态
      chatRecords.value[index].loading = false
      prompt.value = ''
    }
    await fetchChatAPIOnce()
  }
  finally {
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
        await downloadHtml2Canvas(document.getElementById('image-wrapper') as HTMLElement, { useCORS: true })
        d.loading = false
        ms.success(t('chat.exportSuccess'))
        Promise.resolve()
      }
      catch (error: any) {
        ms.error(t('chat.exportFailed'))
      }
      finally {
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
    onPositiveClick: async () => {
      const selectedItem = chatRecords.value[index]
      const data = await DeleteChatRecord(selectedItem.chatRecordId)
      if (data.code === 200)
        chatRecords.value.splice(index, 1)
    },
  })
}

// 结束请求
function handleStop() {
  if (loading.value) {
    controller.value.abort()
    loading.value = false
    // 刷新loading状态
    chatRecords.value.forEach(m => m.loading = false)
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
  }
  else {
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
const placeholder = computed(() => {
  if (isMobile.value)
    return t('chat.placeholderMobile')
  return t('chat.placeholder')
})
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
          <template v-if="!chatRecords.length">
            <div class="flex items-center justify-center mt-4 text-center text-neutral-300">
              <SvgIcon icon="ri:bubble-chart-fill" class="mr-2 text-3xl" />
              <span>QQ群：814880639 </span>
            </div>
            <div class="flex items-center justify-center mt-4 text-center text-neutral-300">
              <span>方便获取第一手更新说明和优惠信息</span>
            </div>
          </template>
          <template v-else>
            <div>
              <Message
                v-for="(item, index) of chatRecords"
                :key="index"
                :date-time="item.createDate"
                :text="item.message"
                :inversion="item.role === 'user'"
                :error="item.error"
                :loading="item.loading"
                @delete="handleDelete(index)"
              />
              <div class="sticky bottom-0 left-0 flex justify-center">
                <NButton v-if="loading" type="warning" @click="handleStop">
                  <template #icon>
                    <SvgIcon icon="ri:stop-circle-line" />
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
      :placeholder="placeholder"
      @submit="ChatConversation"
    >
      <HoverButton v-if="!isMobile" @click="showModal = true">
        <span class="text-xl text-[#4f555e] dark:text-white">
          <NPopover trigger="hover">
            <template #trigger>
              <SvgIcon class="text-2xl cursor-pointer" icon="ri:file-user-line" />
            </template>
            <span>聊天设置</span>
          </NPopover>
        </span>
      </HoverButton>
      <HoverButton v-if="!isMobile" @click="toggleUsingContext">
        <span class="text-xl" :class="{ 'text-[#4b9e5f]': usingContext, 'text-[#a8071a]': !usingContext }">
          <NPopover trigger="hover">
            <template #trigger>
              <SvgIcon icon="ri:chat-history-line" />
            </template>
            <span>是否包含上文</span>
          </NPopover>
        </span>
      </HoverButton>
    </SubmitFooter>
    <NModal v-model:show="showModal" style="width: 90%; max-width: 600px;" preset="card">
      <NForm
        ref="formRef"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <NFormItem label="系统提示词" path="verifycationCode">
          <NInput />
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
