<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import type { UploadFileInfo } from 'naive-ui'
import { NButton, NGradientText, NInput, NNumberAnimation, NSpin, NStatistic, NTime, NUpload, useMessage } from 'naive-ui'
import { baseUrl, useAuthStore, useUserStore } from '@/store'
import { useAuthStoreWithout } from '@/store/modules/auth'
import { fetchGetUser, fetchUpdateUser } from '@/api'
import { router } from '@/router'

interface Emits {
  (e: 'openStore'): void
}

const emit = defineEmits<Emits>()
interface UserInfo {
  userId: number // id
  userName: string// 用户名
  roleId?: number// 角色
  headImageUrl: string | null | undefined// 头像url
  vipLevel?: number// vip等级
  vipExpireTime?: Date// vip过期时间
  imageCount?: string// 剩余图片使用次数
  balance: number// 用户余额
}
const config = ref<UserInfo>()
const ms = useMessage()
const userStore = useUserStore()
const loading = ref(false)
const computedConfig = computed(() => config.value || {} as UserInfo)
const apiUrl = baseUrl
const fileList = ref<UploadFileInfo[]>()
const uploadUrl = `${apiUrl}/api/v1/Product/UploadProductImage`

const handleFinish = ({ file, event }: { file: UploadFileInfo; event?: ProgressEvent }) => {
  const res = JSON.parse((event?.target as XMLHttpRequest).response)
  file.url = `${apiUrl}${res.data}`
  return file
}

function handleReset() {
  const authStore = useAuthStoreWithout()
  authStore.removeToken()
  router.push('/login')
}
function updateUserInfo(options: Partial<UserInfo>) {
  userStore.updateUserInfo(options)
}

async function fetchUser() {
  try {
    loading.value = true
    const { data } = await fetchGetUser<UserInfo>()
    config.value = data
    if (data.headImageUrl !== null) {
      fileList.value = [
        {
          id: 'c',
          name: '我是自带url的图片.png',
          status: 'finished',
          url: data.headImageUrl,
        },
      ]
    }
    else {
      fileList.value = []
    }
    updateUserInfo(data)
  }
  finally {
    loading.value = false
  }
}

async function UpdateUser() {
  if (config.value == null) {
    ms.error('获取用户失败')
    return
  }
  if (fileList.value !== null && fileList.value![0] !== null)
    config.value.headImageUrl = fileList.value![0].url
  const { data } = await fetchUpdateUser(config.value.userId, config.value.userName, config.value?.headImageUrl)
  if (data)
    ms.success('保存成功')

  else
    ms.error('保存失败')
}

onMounted(() => {
  fetchUser()
})
</script>

<template>
  <NSpin :show="loading">
    <div class="p-4 space-y-5 min-h-[200px]">
      <div class="space-y-6">
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">{{ $t('setting.name') }}</span>
          <div class="w-[200px]">
            <NInput v-model:value="computedConfig.userName" placeholder="" />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">{{ $t('setting.avatarLink') }}</span>
          <div class="w-[200px]">
            <NUpload
              v-model:file-list="fileList"
              :action="uploadUrl"
              :headers="{ Authorization: `Bearer ${useAuthStore().token}` }"
              list-type="image-card"
              :max="1"
              accept="image/png, image/jpeg"
              @finish="handleFinish"
            />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">{{ $t('setting.vipLevel') }}</span>
          <div v-if="computedConfig.vipExpireTime" class="flex-1">
            <NGradientText
              gradient="linear-gradient(90deg, red 0%, green 50%, blue 100%)"
            >
              尊贵的VIP用户
            </NGradientText>
          </div>
          <NButton size="small" color="#8a2be2" @click="emit('openStore')">
            {{ $t('setting.tobeVip') }}
          </NButton>
        </div>
        <div v-if="computedConfig.vipExpireTime" class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">{{ $t('setting.vipExpireTime') }}</span>
          <div class="flex-1">
            <NTime :time="new Date(computedConfig.vipExpireTime)" type="date" />
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="flex-shrink-0 w-[100px]">{{ $t('setting.balance') }}</span>
          <div class="flex-1">
            <NStatistic tabular-nums>
              <NNumberAnimation :from="0.0" :to="computedConfig.balance" :precision="3" />
              <template #prefix>
                ￥
              </template>
            </NStatistic>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <NButton size="small" type="success" @click="UpdateUser">
            {{ $t('common.save') }}
          </NButton>
          <div class="flex-1" />
          <NButton size="small" @click="handleReset">
            {{ $t('setting.logout') }}
          </NButton>
        </div>
      </div>
    </div>
  </NSpin>
</template>
