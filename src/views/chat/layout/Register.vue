<template>
	<div class="h-full relative bg-center bg-cover bg-no-repeat" :style="{backgroundImage:`url(${backgroundImageURL})`}">
		<div class="absolute w-1/4 p-4 right-40 bottom-1/2 translate-y-1/2">
				<h2 class="text-white text-center pb-4 text-2xl font-mono font-bold">TERRA MOURS</h2>
				<NForm ref="formRef" :model="model" :rules="rules" size="medium" label-placement="left">
					<NFormItem path="email">
						<NInput placeholder="电子邮箱" v-model:value="model.email">
							<template #prefix>
								<SvgIcon icon="ant-design:user-outlined"/>
							</template>
						</NInput>
					</NFormItem>
                    <NFormItem path="code">
						<NInput placeholder="验证码" v-model:value="model.code">
							<template #prefix>
								<SvgIcon icon="ant-design:user-outlined"/>
							</template>
						</NInput>
                        <NButton size="large" :disabled="isCounting" type="primary" :loading="smsLoading" @click="handleSmsCode">{{ label }}</NButton>
					</NFormItem>
					<NFormItem path="pwd">
						<NInput type="password" show-password-on="click" placeholder="请输入密码" v-model:value="model.pwd">
							<template #prefix>
								<SvgIcon icon="ant-design:unlock-outlined"/>
							</template>
						</NInput>
					</NFormItem>
                    <NFormItem path="confirmPwd">
						<NInput type="password" show-password-on="click" placeholder="确认密码" v-model:value="model.confirmPwd">
							<template #prefix>
								<SvgIcon icon="ant-design:unlock-outlined"/>
							</template>
						</NInput>
					</NFormItem>
					<NSpace :vertical="true" :size="24">
						<NButton
							type="primary"
							size="large"
							:block="true"
							@click="handleSubmit"
						>
							确定
						</NButton>
						<div class="flex-y-center justify-between">
							<!-- 手机验收码登录 -->
							<!-- <NButton class="flex-1" :block="true" @click="toLoginModule('code-login')">
								{{ loginModuleLabels['code-login'] }}
							</NButton> -->

							<div class="w-12px"></div>
							<NButton class="flex-1" :block="true" @click="toLogin">
								返回
							</NButton>
						</div>
					</NSpace>
				</NForm>
		</div>

	</div>
</template>

<script setup lang="ts">
import {reactive, ref,toRefs} from 'vue';
import {NForm, NFormItem, NInput, NSpace, NButton, FormInst,FormRules} from 'naive-ui';
import SvgIcon from '@/components/common/SvgIcon/index.vue'
import {fetchRegister} from "@/api";
import {useMessage} from 'naive-ui'
import {useRouter} from 'vue-router'
import  useSmsCode  from '../hooks/use-sms-code';
import { formRules, getConfirmPwdRule } from '@/views/chat/hooks'

// import { OtherAccount } from './components';
const { label, isCounting, loading: smsLoading, getEmailCode } = useSmsCode();
const model = reactive({
  email: '',
  code: '',
  pwd: '',
  confirmPwd: ''
});

const rules: FormRules = {
  email: formRules.email,
  code: formRules.code,
  pwd: formRules.pwd,
  confirmPwd: getConfirmPwdRule(toRefs(model).pwd)
};

interface Props {
	visible: boolean
}

const backgroundImageURL = '/login_bg.png'
defineProps<Props>()
const formRef = ref<HTMLElement & FormInst>();

const message = useMessage()
const router = useRouter()
// 发送验证码
function handleSmsCode() {
  getEmailCode(model.email);
}

// 点击注册按钮
async function handleSubmit() {
  await formRef.value?.validate();
  const data  = await fetchRegister(model.email, model.pwd, model.confirmPwd, model.code);
  if (data.code === 200) {
    message.success(data.data);
    await router.push("/login")
  } else {
    message.warning('注册失败!');
  }
}
const toLogin=async ()=>{
	await router.push("/login")
}
</script>
