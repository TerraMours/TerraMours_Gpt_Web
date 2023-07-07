<template>
	<div class="h-full relative">
		<NRow>
			<NCol span="12">
				<NStatistic label="已使用次数" :value="usedCount">
					<template #suffix>
						/ 100
					</template>
				</NStatistic>
			</NCol>
			<NCol :span="12">
				<NStatistic label="当前队列等待任务数" :value="waitingCount"></NStatistic>
			</NCol>
		</NRow>

		<!--		<div v-show="formData.modelType !== 1">-->
		<!--			<span style="font-size: 24px;">返回图片数量1-10，本站不保存图片，需要请立即下载。</span>-->
		<!--			<NSpace vertical>-->
		<!--				<NSlider v-model:value="formData.Count" :max="10" :min="1"/>-->
		<!--			</NSpace>-->
		<!--		</div>-->
		<div
			id="image-scroll-container"
			style="
		      overflow: auto;
		      height: 450px;
		      display: flex;
		      flex-direction: column;
		      gap: 8px;
		    "
		>
			<NImage
				v-for="(imageUrl, index) in imgUrl"
				:key="index"
				width="512"
				height="512"
				lazy
				:src="imageUrl"
				:intersection-observer-options="{
		        root: '#image-scroll-container',
		      }"
				style="margin-bottom: 10px;"
			>
				<template #placeholder>
					<div
						style="
		            width: 100px;
		            height: 100px;
		            display: flex;
		            align-items: center;
		            justify-content: center;
		            background-color: #0001;
		          "
					>
						Loading
					</div>
				</template>
			</NImage>
		</div>
		<div class="absolute bottom-0 w-full">
			<submit-footer v-model="formData.Prompt" placeholder="请输入图片描述词" @submit="submit">
				<NPopselect v-model:value="formData.modelType" :options="modelTypeOptions" trigger="click"
										:on-update:value="(value)=>{formData.modelType = value;formData.Count = 1}">
					<NButton>{{ modelTypeOptions.find(i => i.value === formData.modelType)?.label || '请选择模型' }}</NButton>
				</NPopselect>
				<NPopselect v-model:value="formData.model" :options="modelOptions" trigger="click"
										:on-update:value="(value)=>{formData.model = value;formData.Count = 1}">
					<NButton>{{ modelOptions.find(i => i.value === formData.model)?.label || '请选择模型' }}</NButton>
				</NPopselect>
				<SvgIcon icon="ri:settings-4-line" @click="showModal=true" class="text-2xl cursor-pointer"/>
				<SvgIcon icon="ri:file-user-line" @click="showModal=true" class="text-2xl cursor-pointer"/>
			</submit-footer>
		</div>


		<NModal v-model:show="showModal" style="width: 90%; max-width: 600px;" preset="card">
			<NForm model="formData" :rules="formRules"
						 ref="formRef"
						 label-placement="left"
						 label-width="auto"
						 require-mark-placement="right-hanging">
				<NFormItem label="图片验证码" path="verifycationCode">
					<NInput v-model:value="formData.verifycationCode"></NInput>
				</NFormItem>
				<NFormItem label="生成数量" v-show="formData.modelType !== 1">
					<NSlider v-model:value="formData.Count" :max="10" :min="1"/>
				</NFormItem>
			</NForm>

		</NModal>

	</div>
</template>

<script lang="ts" setup>
import {
	NImage,
	NInput,
	NButton,
	NSlider,
	useMessage,
	NCol,
	NStatistic,
	NRow,
	NModal,
	NForm,
	NFormItem,
	NPopselect
} from "naive-ui";
import {reactive, ref} from "vue";
import axios from 'axios';
import {useAuthStoreWithout} from '@/store/modules/auth'
import {useSignalR} from '@/views/chat/hooks/useSignalR';
import SubmitFooter from "@/components/common/SubmitFooter/submitFooter.vue";
import {SvgIcon} from '@/components/common'
// 定义后端接口的地址
const apiUrl = import.meta.env.VITE_GLOB_API_URL;
const apiBaseUrl = import.meta.env.VITE_APP_API_BASE_URL;
const authStore = useAuthStoreWithout();
const usedCount = ref(0);//已生成图片数量
const modelTypeOptions: Array<{ label: string; value: number }> = [
	{label: 'CHATGPT', value: 0},
	{label: 'SD', value: 1},
];
const modelOptions: Array<{ label: string; value: string }> = [
	{label: '二次元', value: '二次元'},
	{label: '真人', value: '真人'},
];
const showModal = ref(false)


const formRules = {
	verifycationCode: {
		required: true,
		message: '请输入图片验证码',
		trigger: 'blur'
	}
}
const ms = useMessage();
//signalR
const {waitingCount, connection, imgUrl} = useSignalR(apiBaseUrl + '/graphhub');

type SubmitDTO = {
	verifycationCode: string
	Prompt: string
	modelType: number
	connectionId: any
	Count: number
	Size: number,
	model: string | null
}

const formData = reactive<SubmitDTO>({
	Prompt: "",
	Count: 1,
	Size: 512,
	verifycationCode: authStore.imgKey ?? "",
	modelType: 1,
	connectionId: null,
	model: null
})


const submit = async () => {
	if (!formData.verifycationCode) {
		ms.warning('请先设置图片验证码')
		showModal.value = true
		return
	}

	if (!connection.value) {
		ms.warning('页面已失效，请刷新页面！');
		return;
	}
	formData.connectionId = connection.value?.connectionId
	try {
		authStore.setImgKey(formData.verifycationCode);
		//signalR
		// 设置请求头
		const headers = {
		'Authorization': 'Bearer ' + authStore.token,
		'Content-Type': 'application/json'
		};
		const response = await axios.post(apiUrl + '/v1/Image/GenerateGraph', formData,{headers});
		if (response.data.code === 500) {
			ms.error(response.data.message ?? 'error')
			return
		}
		ms.success(response.data.data);

	} catch (error) {
		console.log(`请求失败：${error}`);
		ms.error('报错拉！：' + error);
	}
	console.log("提交的参数：", formData); // 在控制台输出提交的参数
};
</script>
