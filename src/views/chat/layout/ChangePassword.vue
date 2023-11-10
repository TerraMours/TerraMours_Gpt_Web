<script setup lang="ts">
import { reactive, ref, toRefs } from 'vue'
import type { FormInst, FormRules } from 'naive-ui'
import { NButton, NForm, NFormItem, NInput, NSpace, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import useSmsCode from '../hooks/use-sms-code'
import SvgIcon from '@/components/common/SvgIcon/index.vue'
import { fetchChangePassword } from '@/api'
import { formRules, getConfirmPwdRule } from '@/views/chat/hooks'

defineProps<Props>()
// import { OtherAccount } from './components';
const { label, isCounting, loading: smsLoading, getEmailCode } = useSmsCode()
const model = reactive({
  email: '',
  code: '',
  pwd: '',
  confirmPwd: '',
})

const rules: FormRules = {
  email: formRules.email,
  code: formRules.code,
  pwd: formRules.pwd,
  confirmPwd: getConfirmPwdRule(toRefs(model).pwd),
}

interface Props {
  visible: boolean
}

const backgroundImageURL = '/login_bg.png'
const formRef = ref<HTMLElement & FormInst>()

const message = useMessage()
const router = useRouter()
// 发送验证码
function handleSmsCode() {
  getEmailCode(model.email)
}
const submitLoading = ref(false)
// 点击注册按钮
async function handleSubmit() {
  if (submitLoading.value)
    return
  await formRef.value?.validate()
  try {
    const data = await fetchChangePassword(model.email, model.pwd, model.confirmPwd, model.code)
    if (data.code === 200) {
      message.success(data.data)
      await router.push('/login')
    }
    else {
      message.warning('修改密码失败!')
    }
  }
  catch (error: any) {
    message.warning(error.message ?? 'error')
  }
  finally {
    submitLoading.value = false
  }
}
const toLogin = async () => {
  await router.push('/login')
}
</script>

<template>
  <div class="h-full relative bg-center bg-cover bg-no-repeat" :style="{ backgroundImage: `url(${backgroundImageURL})` }">
    <div class="absolute w-1/4 p-4 right-40 bottom-1/2 translate-y-1/2">
      <h2 class="text-white text-center pb-4 text-2xl font-mono font-bold">
        修改密码
      </h2>
      <NForm ref="formRef" :model="model" :rules="rules" size="medium" label-placement="left">
        <NFormItem path="email">
          <NInput v-model:value="model.email" placeholder="电子邮箱">
            <template #prefix>
              <SvgIcon icon="ant-design:user-outlined" />
            </template>
          </NInput>
        </NFormItem>
        <NFormItem path="code">
          <NInput v-model:value="model.code" placeholder="验证码">
            <template #prefix>
              <SvgIcon icon="ant-design:user-outlined" />
            </template>
          </NInput>
          <NButton size="large" :disabled="isCounting" type="primary" :loading="smsLoading" @click="handleSmsCode">
            {{ label }}
          </NButton>
        </NFormItem>
        <NFormItem path="pwd">
          <NInput v-model:value="model.pwd" type="password" show-password-on="click" placeholder="请输入密码">
            <template #prefix>
              <SvgIcon icon="ant-design:unlock-outlined" />
            </template>
          </NInput>
        </NFormItem>
        <NFormItem path="confirmPwd">
          <NInput v-model:value="model.confirmPwd" type="password" show-password-on="click" placeholder="确认密码">
            <template #prefix>
              <SvgIcon icon="ant-design:unlock-outlined" />
            </template>
          </NInput>
        </NFormItem>
        <NSpace :vertical="true" :size="24">
          <NButton
            type="primary"
            size="large"
            :block="true"
						:loading="submitLoading"
            @click="handleSubmit"
          >
            确定
          </NButton>
          <div class="flex-y-center justify-between">
            <div class="w-12px" />
            <NButton class="flex-1" :block="true" @click="toLogin">
              返回
            </NButton>
          </div>
        </NSpace>
      </NForm>
    </div>
  </div>
</template>
