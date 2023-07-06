<template>
    <div class="p-4 space-y-5 min-h-[200px]">
        <div class="space-y-6">
            <div class="flex items-center space-x-4">
                <span class="flex-shrink-0 w-[100px]">{{ $t('setting.name') }}</span>
                <div class="w-[200px]">
                <NInput v-model:value="name" placeholder="" />
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <span class="flex-shrink-0 w-[100px]">{{ $t('setting.avatarLink') }}</span>
                <div class="flex-1">
                <NInput v-model:value="avatar" placeholder="" />
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
                    <NTime :time="0" type="date" />
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
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import {useUserStore } from '@/store'
import { NButton, NInput, NGradientText, NTime, useMessage } from 'naive-ui'
import { useAuthStoreWithout } from '@/store/modules/auth'
import { t } from '@/locales'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const ms = useMessage()
const avatar = ref(userInfo.value.avatar ?? '')

const name = ref(userInfo.value.name ?? '')

function handleReset() {
  userStore.resetUserInfo()
  const authStore = useAuthStoreWithout()
  authStore.removeToken()
  ms.success(t('common.success'))
  window.location.reload()
}
</script>