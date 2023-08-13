<script setup lang="ts">
import {reactive, ref} from 'vue'
import type {FormInst} from 'naive-ui'
import {NButton, NCheckbox, NForm, NFormItem, NGrid, NGridItem, NInput, NSpace, NSpin, useMessage} from 'naive-ui'
import {useRouter} from 'vue-router'
import SvgIcon from '@/components/common/SvgIcon/index.vue'
import {login} from '@/api'
import {useAuthStore, useUserStore} from '@/store'
import {getLocalState} from "@/store/modules/user/helper";

defineProps<Props>()

interface Props {
	visible: boolean
}

const store = useAuthStore()
const userStore = useUserStore()
const localState = getLocalState().userInfo
const saveMe = ref(Boolean(localState.userAccount && localState.userPassword))


const backgroundImageURL = '/login_bg.png'
const formRef = ref<HTMLElement & FormInst>()

interface LoginDTO {
	userAccount: string
	userPassword: string
}

const formRules = {
	userAccount: {
		required: true,
		trigger: 'blur',
		message: '请输入用户名',
	},
	userPassword: {
		required: true,
		trigger: 'blur',
		message: '请输入密码',
	},
}

const formData = reactive<LoginDTO>({
	userAccount: localState.userAccount ?? 'terramours@163.com',
	userPassword: localState.userPassword ?? '',
})

const loading = ref(false)
const message = useMessage()
const router = useRouter()
const toRegister = async () => {
	await router.push('/register')
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
			// 记住密码
			userStore.updateUserInfo(Object.assign({}, formData, saveMe.value ? {} : {userPassword: ''}))
			store.setToken(loginRes.data.token)
			message.success('登录成功！')
			await router.push('/chat')
			return
		}
		message.warning('登录出错,请联系管理员')
	})
}
</script>

<template>
	<div
		class="h-full relative bg-center bg-cover bg-no-repeat"
		:style="{ backgroundImage: `url(${backgroundImageURL})` }"
	>
		<NGrid cols="1 xs:10 m:6 l:24 xl:24 " item-responsive responsive="screen">
			<NGridItem span="0 xs:2 m:2 l:14 xl:15"/>
			<NGridItem span="0 xs:6 m:2 l:6 xl:5">
				<div class="translate-y-2/3">
					<NSpin :show="loading">
						<h2 class="text-white text-center pb-4 text-2xl font-mono font-bold">
							TERRA MOURS
						</h2>
						<NForm ref="formRef" size="medium" label-placement="left" :model="formData" :rules="formRules">
							<NFormItem path="userAccount">
								<NInput v-model:value="formData.userAccount" placeholder="请输入用户名">
									<template #prefix>
										<SvgIcon icon="ant-design:user-outlined"/>
									</template>
								</NInput>
							</NFormItem>
							<NFormItem path="userPassword">
								<NInput
									v-model:value="formData.userPassword" type="password" show-password-on="click"
									placeholder="请输入密码"
								>
									<template #prefix>
										<SvgIcon icon="ant-design:unlock-outlined"/>
									</template>
								</NInput>
							</NFormItem>
							<NSpace :vertical="true" :size="24">
								<div class="flex-y-center justify-between">
									<NSpace :size="15">
										<NCheckbox :checked="saveMe" @update:checked="saveMe = !saveMe">
											<span class="text-slate-300">记住我</span>
										</NCheckbox>
										<NButton :text="true">
                      <span class="text-slate-300">
                        忘记密码？
                      </span>
										</NButton>
									</NSpace>
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

									<div class="w-12px"/>
									<NButton class="flex-1" :block="true" @click="toRegister">
                    <span class="text-slate-300">
                      注册
                    </span>
									</NButton>
								</div>
							</NSpace>
							<!-- 其他账户登录 -->
							<!-- <other-account @login="handleLoginOtherAccount" /> -->
						</NForm>
					</NSpin>
				</div>
			</NGridItem>
			<NGridItem span="0 xs:2 m:2 l:4 xl:4"/>
		</NGrid>
		<!--    <div class="absolute w-1/4 p-4 right-40 bottom-1/2 translate-y-1/2"> -->
		<!--   -->
		<!--    </div> -->
	</div>
</template>
