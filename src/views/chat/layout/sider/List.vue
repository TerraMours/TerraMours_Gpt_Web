<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { NInput, NPopconfirm, NScrollbar } from 'naive-ui'
import { SvgIcon } from '@/components/common'
import { useAppStore, useChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { debounce } from '@/utils/functions/debounce'
import type { ChatConversationRes } from '@/api'
import { AddChatConversation, ChangeChatConversation, ChatConversationList, DeleteChatConversation } from '@/api'

const { isMobile } = useBasicLayout()

const appStore = useAppStore()
const chatStore = useChatStore()
// new
const conversationList = ref<ChatConversationRes[]>([])

async function handleSelect({ conversationId }: ChatConversationRes) {
  if (isActive(conversationId))
    return
  await chatStore.setActive(conversationId)
  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

async function handleEdit(conversation: ChatConversationRes, isEdit: boolean, event?: MouseEvent) {
  event?.stopPropagation()
  conversation.isEdit = isEdit
  if (isEdit === false)
    await ChangeChatConversation(conversation.conversationId, conversation.conversationName)
}

async function handleDelete(index: number, event?: MouseEvent | TouchEvent) {
  event?.stopPropagation()
  const delItem = conversationList.value[index]

  const data = await DeleteChatConversation(delItem.conversationId)
  if (data.code === 200) {
    conversationList.value.splice(index, 1)
    chatStore.active = conversationList.value.length > 0 ? conversationList.value[index - 1].conversationId : 0
  }
  if (isMobile.value)
    appStore.setSiderCollapsed(true)
}

const handleDeleteDebounce = debounce(handleDelete, 600)

async function handleEnter(conversation: ChatConversationRes, isEdit: boolean, event: KeyboardEvent) {
  event?.stopPropagation()
  if (event.key === 'Enter') {
    conversation.isEdit = isEdit
    if (isEdit === false)
      await ChangeChatConversation(conversation.conversationId, conversation.conversationName)
  }
}

function isActive(uuid: number) {
  return chatStore.active === uuid
}
onMounted(async () => {
  const { data } = await ChatConversationList(1, 100, null)
  if (data.items != null) {
    conversationList.value = data.items
    if (data.items.length > 0) {
      if (!data.items.some(m => m.conversationId === chatStore.active))
        chatStore.active = data.items[0].conversationId
    }
    else { chatStore.active = 0 }
  }
})

const addConversation = async (conversationName: string) => {
  const data = await AddChatConversation(conversationName)
  if (data.code === 200) {
    conversationList.value = [data.data, ...conversationList.value]
    chatStore.active = data.data.conversationId
  }
}
defineExpose({ addConversation })
</script>

<template>
  <NScrollbar class="px-4">
    <div class="flex flex-col gap-2 text-sm">
      <template v-if="!conversationList.length">
        <div class="flex flex-col items-center mt-4 text-center text-neutral-300">
          <SvgIcon icon="ri:inbox-line" class="mb-2 text-3xl" />
          <span>{{ $t('common.noData') }}</span>
        </div>
      </template>
      <template v-else>
        <div v-for="(item, index) of conversationList" :key="index">
          <a
            class="relative flex items-center gap-3 px-3 py-3 break-all border rounded-md cursor-pointer hover:bg-neutral-100 group dark:border-neutral-800 dark:hover:bg-[#24272e]"
            :class="isActive(item.conversationId) && ['border-[#4b9e5f]', 'bg-neutral-100', 'text-[#4b9e5f]', 'dark:bg-[#24272e]', 'dark:border-[#4b9e5f]', 'pr-14']"
            @click="handleSelect(item)"
          >
            <span>
              <SvgIcon icon="ri:message-3-line" />
            </span>
            <div class="relative flex-1 overflow-hidden break-all text-ellipsis whitespace-nowrap">
              <NInput
                v-if="item.isEdit"
                v-model:value="item.conversationName" size="tiny"
                @keypress="handleEnter(item, false, $event)"
              />
              <span v-else>{{ item.conversationName }}</span>
            </div>
            <div v-if="isActive(item.conversationId)" class="absolute z-10 flex visible right-1">
              <template v-if="item.isEdit">
                <button class="p-1" @click="handleEdit(item, false, $event)">
                  <SvgIcon icon="ri:save-line" />
                </button>
              </template>
              <template v-else>
                <button class="p-1">
                  <SvgIcon icon="ri:edit-line" @click="handleEdit(item, true, $event)" />
                </button>
                <NPopconfirm placement="bottom" @positive-click="handleDeleteDebounce(index, $event)">
                  <template #trigger>
                    <button class="p-1">
                      <SvgIcon icon="ri:delete-bin-line" />
                    </button>
                  </template>
                  {{ $t('chat.deleteHistoryConfirm') }}
                </NPopconfirm>
              </template>
            </div>
          </a>
        </div>
      </template>
    </div>
  </NScrollbar>
</template>
