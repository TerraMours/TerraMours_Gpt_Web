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
                <span class="flex-shrink-0 w-[100px]">{{ $t('setting.vipLevel') }}</span>
                <div class="flex-1">
                    <NGradientText
                        gradient="linear-gradient(90deg, red 0%, green 50%, blue 100%)"
                    >
                        尊贵的VIP用户
                    </NGradientText>
                </div>
                <NButton size="small" @click="handleReset" color="#8a2be2">
                {{ $t('setting.tobeVip') }}
                </NButton>
            </div>
            <div class="flex items-center space-x-4">
                <span class="flex-shrink-0 w-[100px]">{{ $t('setting.vipExpireTime') }}</span>
                <div class="flex-1">
                    <NTime :time="0" type="date" v-model:value="computedConfig.vipExpireTime"/>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <NButton size="small" @click="handleReset" type="success">
                {{ $t('common.save') }}
                </NButton>
                <div class="flex-1">
                </div>
                <NButton size="small" @click="handleReset">
                {{ $t('setting.logout') }}
                </NButton>
            </div>
            
        </div>
    </div>
</NSpin>
</template>

<script lang="ts" setup>
import { computed,ref,onMounted } from 'vue'
import {useUserStore } from '@/store'
import { NButton, NInput, NGradientText, NTime, useMessage,NSpin } from 'naive-ui'
import { useAuthStoreWithout } from '@/store/modules/auth'
import { t } from '@/locales'
import { fetchGetUser } from '@/api'

interface UserInfo {
    userName?: string// 用户名
    roleId?: number// 角色
    headImageUrl?: string//头像url
    vipLevel?: string//vip等级
    vipExpireTime?: string//vip过期时间
    imageCount?: string//剩余图片使用次数
}
const config = ref<UserInfo>()

const userStore = useUserStore()
const ms = useMessage()
const loading = ref(false)
const computedConfig = computed(() => config.value || {});
function handleReset() {
  userStore.resetUserInfo()
  const authStore = useAuthStoreWithout()
  authStore.removeToken()
  ms.success(t('common.success'))
  window.location.reload()
}
function updateUserInfo(options: Partial<UserInfo>) {
  userStore.updateUserInfo(options)
  ms.success(t('common.success'))
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

onMounted(() => {
    fetchUser()
})
</script>