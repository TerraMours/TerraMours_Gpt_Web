<template>
    <NForm  ref="formRef"  size="large" >
      <NFormItem path="userName">
        <NInput  placeholder="请输入用户名" />
      </NFormItem>
      <NFormItem path="password">
        <NInput  type="password" show-password-on="click" placeholder="请输入密码" />
      </NFormItem>
      <NSpace :vertical="true" :size="24">
        <div class="flex-y-center justify-between">
          <NCheckbox >记住我</NCheckbox>
          <NButton :text="true" >忘记密码？</NButton>
        </div>
        <NButton
          type="primary"
          size="large"
          :block="true"
          :round="true"
        >
          确定
        </NButton>
        <div class="flex-y-center justify-between">
          <!-- 手机验收码登录 -->
          <!-- <NButton class="flex-1" :block="true" @click="toLoginModule('code-login')">
            {{ loginModuleLabels['code-login'] }}
          </NButton> -->
          <div class="w-12px"></div>
          <NButton class="flex-1" :block="true" >
            注册
          </NButton>
        </div>
      </NSpace>
      <!-- 其他账户登录 -->
      <!-- <other-account @login="handleLoginOtherAccount" /> -->
    </NForm>
  </template>
  
  <script setup lang="ts">
  import {  ref } from 'vue';
  import type {NForm,NFormItem,NInput,NSpace,NCheckbox,NButton, FormInst } from 'naive-ui';
  // import { OtherAccount } from './components';
  interface Props {
  visible: boolean
}

defineProps<Props>()

  
  const formRef = ref<HTMLElement & FormInst>();
  
  </script>
  
  <style scoped></style>
  