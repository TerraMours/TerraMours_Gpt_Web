<template>
	<div class="h-full relative bg-center bg-cover bg-no-repeat" :style="{backgroundImage:`url(${backgroundImageURL})`}">
		<div class="absolute w-1/4 p-4 right-40 bottom-1/2 translate-y-1/2">
			<NSpin :show="loading">
				<h2 class="text-white text-center pb-4 text-2xl font-mono font-bold">TERRA MOURS</h2>
				<NForm ref="formRef" size="medium" label-placement="left" :model="formData" :rules="formRules">
					<NFormItem path="userAccount">
						<NInput placeholder="请输入用户名" v-model:value="formData.userAccount">
							<template #prefix>
								<SvgIcon icon="ant-design:user-outlined"/>
							</template>
						</NInput>
					</NFormItem>
					<NFormItem path="userPassword">
						<NInput type="password" show-password-on="click" placeholder="请输入密码" v-model:value="formData.userPassword">
							<template #prefix>
								<SvgIcon icon="ant-design:unlock-outlined"/>
							</template>
						</NInput>
					</NFormItem>
					<NSpace :vertical="true" :size="24">
						<div class="flex-y-center justify-between">
							<NCheckbox>记住我</NCheckbox>
							<NButton :text="true">忘记密码？</NButton>
						</div>
						<NButton
							type="primary"
							size="large"
							:block="true"
							@click="loginHandle"
						>
							确定
						</NButton>
						<div class="flex-y-center justify-between">
							<!-- 手机验收码登录 -->
							<!-- <NButton class="flex-1" :block="true" @click="toLoginModule('code-login')">
								{{ loginModuleLabels['code-login'] }}
							</NButton> -->

							<div class="w-12px"></div>
							<NButton class="flex-1" :block="true" @click="toRegister">
								注册
							</NButton>
						</div>
					</NSpace>
					<!-- 其他账户登录 -->
					<!-- <other-account @login="handleLoginOtherAccount" /> -->
				</NForm>
			</NSpin>
		</div>

	</div>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue';
import {NForm, NSpin, NFormItem, NInput, NSpace, NCheckbox, NButton, FormInst} from 'naive-ui';
import SvgIcon from '@/components/common/SvgIcon/index.vue'
import {login} from "@/api";
import {useAuthStore} from '@/store/modules/auth/index'
import {useMessage} from 'naive-ui'
import {useRouter} from 'vue-router'

// import { OtherAccount } from './components';
const store = useAuthStore()

interface Props {
	visible: boolean
}

const backgroundImageURL = 'src/assets/login_bg.png'
defineProps<Props>()
const formRef = ref<HTMLElement & FormInst>();

interface LoginDTO {
	userAccount: string
	userPassword: string
}

const formRules = {
	userAccount: {required: true, trigger: 'blur', message: '请输入用户名'},
	userPassword: {required: true, trigger: 'blur', message: '请输入密码'}
}

const formData = reactive<LoginDTO>({
	userAccount: "terramours@163.com",
	userPassword: "",
})

const loading = ref(false)
const message = useMessage()
const router = useRouter()
const toRegister=async ()=>{
	await router.push("/register")
}
const loginHandle = () => {
	formRef.value?.validate(async (err) => {
		loading.value = true
		if (err) {
			loading.value = false
			return
		}
		const loginRes = await login(formData)
		loading.value = false
		if (loginRes.code === 200) {
			store.setToken(loginRes.data.token)
			message.success('登录成功！')
			await router.push("/chat")
			return
		}
		message.warning('登录出错,请联系管理员')
	})

}

</script>
