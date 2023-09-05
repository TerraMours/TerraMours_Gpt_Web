<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { NButton, NInput, NNumberAnimation, NSpin, NStatistic, NTime, useMessage } from 'naive-ui'
import { useUserStore } from '@/store'
import { useAuthStoreWithout } from '@/store/modules/auth'
import { fetchGetUser, fetchUpdateUser } from '@/api'

interface UserInfo {
  userId: number // id
  userName: string// 用户名
  roleId?: number// 角色
  headImageUrl: string// 头像url
  vipLevel?: string// vip等级
  vipExpireTime?: string// vip过期时间
  imageCount?: string// 剩余图片使用次数
  balance: number// 用户余额
}
const config = ref<UserInfo>()
const ms = useMessage()
const userStore = useUserStore()
const loading = ref(false)
const computedConfig = computed(() => config.value || {} as UserInfo)
function handleReset() {
  userStore.resetUserInfo()
  const authStore = useAuthStoreWithout()
  authStore.removeToken()
  window.location.reload()
}
function updateUserInfo(options: Partial<UserInfo>) {
  userStore.updateUserInfo(options)
}

async function fetchUser() {
  try {
    loading.value = true
    const { data } = await fetchGetUser<UserInfo>()
    config.value = data
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
          <div class="flex-1">
            <NInput v-model:value="computedConfig.headImageUrl" placeholder="" />
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
          <NButton style="display: none;" size="small" color="#8a2be2" @click="handleReset">
            {{ $t('setting.tobeVip') }}
          </NButton>
        </div>
        <div class="flex items-center space-x-4" style="display: none;">
          <span class="flex-shrink-0 w-[100px]">{{ $t('setting.vipExpireTime') }}</span>
          <div class="flex-1">
            <NTime v-model:value="computedConfig.vipExpireTime" :time="0" type="date" />
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
