<template>
	<div style="">
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

		<div v-show="formData.modelType !== 1">
			<span style="font-size: 24px;">返回图片数量1-10，本站不保存图片，需要请立即下载。</span>
			<NSpace vertical>
				<NSlider v-model:value="formData.Count" :max="10" :min="1"/>
				<NInputNumber v-model:value="numOfImages" size="small" :max="10" :min="1"/>
			</NSpace>
		</div>
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
		<submit-footer v-model="formData.Prompt" placeholder="请输入图片描述词" @submit="submit">
			<SvgIcon icon="ri:settings-4-line" @click="showModal=true" style="font-size: 1.5rem;cursor: pointer"/>
		</submit-footer>

		<NModal v-model:show="showModal" style="width: 90%; max-width: 600px;" preset="card">
			<NForm model="formData" :rules="formRules"
						 ref="formRef"
						 label-placement="left"
						 label-width="auto"
						 require-mark-placement="right-hanging">
				<NFormItem label="图片验证码" path="verifycationCode">
					<NInput v-model="formData.verifycationCode"></NInput>
				</NFormItem>
				<NFormItem label="模型" path="modelType">
					<NSelect
						style="width: 140px"
						v-model:value="formData.modelType"
						:options="modelOptions"
					/>

				</NFormItem>

			</NForm>

		</NModal>

	</div>
</template>

<script lang="ts" setup>
import {
	NImage,
	NSelect,
	NInput,
	NButton,
	NSpace,
	NSlider,
	NInputNumber,
	useMessage,
	NCol,
	NStatistic,
	NIcon,
	NRow,
	NModal,
	NForm,
	NFormItem
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
const numOfImages = ref(1); // 初始值为1
const usedCount = ref(0);//已生成图片数量
const modelOptions: Array<{ label: string; value: number }> = [
	{label: 'CHATGPT', value: 0},
	{label: 'SD', value: 1},
];
const showModal = ref(false)

const onPositiveClick = () => {
}
const formRules = {}
const ms = useMessage();
//signalR
const {waitingCount, connection, imgUrl} = useSignalR(apiBaseUrl + '/graphhub');

type SubmitDTO = {
	verifycationCode: string
	Prompt: string
	modelType: number
	connectionId: any
	Count: number
	SizeType: number
}

const formData = reactive<SubmitDTO>({
	Prompt: "",
	Count: 1,
	SizeType: 1,
	verifycationCode: authStore.imgKey ?? "",
	modelType: 1,
	connectionId: connection.value?.connectionId
})


const submit = async () => {
	if (!connection.value) {
		ms.warning('页面已失效，请刷新页面！');
		return;
	}

	try {
		authStore.setImgKey(formData.verifycationCode);
		//signalR
		const response = await axios.post(apiUrl + '/GenerateGraph', formData);
		if (response.data.status === 'Fail') {
			ms.error(response.data.message ?? 'error')
			return
		}
		usedCount.value = response.data.data;
		ms.success(response.data.message);

	} catch (error) {
		console.log(`请求失败：${error}`);
		ms.error('报错拉！：' + error);
	}
	console.log("提交的参数：", formData); // 在控制台输出提交的参数
};
</script>
