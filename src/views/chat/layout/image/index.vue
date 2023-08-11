<template>
	<div class="h-full relative">
		<NTabs type="segment">
			<NTabPane name="chap1" tab="我的绘画"/>
			<NTabPane name="chap2" tab="绘画广场"/>
		</NTabs>
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
		      height: 600px;
		      display: flex;
		      flex-wrap: wrap;
		      gap: 8px;
		    "
		>
		<NCard v-for="(imageUrl, index) in imgUrl" :key="index" shadow="hover" style="margin-bottom: 10px;max-width: 300px;" >
			<NImage
				width="512"
				height="512"
				lazy
				:src="imageUrl"
				:intersection-observer-options="{
				root: '#image-scroll-container',
				}"
			>
				<template #placeholder>
				<div style="
					width: 100px;
					height: 100px;
					display: flex;
					align-items: center;
					justify-content: center;
					background-color: #0001;
				">
					Loading
				</div>
				</template>
			</NImage>
			<div style="display: flex; justify-content: end; margin-top: 8px;">
				<span style="margin-right: 8px;">
				<SvgIcon icon="ri:thumb-up-fill"  class="text-2xl cursor-pointer" color="#0e7a0d"/>
				1
				</span>
				<span style="margin-right: 8px;">
				<SvgIcon icon="ri:thumb-down-fill"  class="text-2xl cursor-pointer"/>
				2
				</span>
				<span>
				<SvgIcon icon="ri:star-fill"  class="text-2xl cursor-pointer"/>
				3
				</span>
			</div>
		</NCard>
		</div>
		<div class="pagination-wrap w-full" v-if="totalPage > 0" style="display: flex; justify-content: center; margin-top: 8px;">
			<NPagination
			:page="page"
			@update:page="updatePage"
			:page-slot="5"
			:page-count="totalPage" />
		</div>
		<div class="absolute bottom-0 w-full">
			<SubmitFooter 
			v-model="formData.Prompt" 
			placeholder="请输入图片描述词" 
			@submit="submit" 
			:search-options="[]" 
			:render-option=null 
			:button-disabled="false"
			:showToken=false
			:counter="500">
				<NPopselect v-model:value="formData.modelType" :options="modelTypeOptions" trigger="click"
										:on-update:value="(value)=>{formData.modelType = value;formData.Count = 1}">
					<NButton>{{ modelTypeOptions.find(i => i.value === formData.modelType)?.label || '请选择模型' }}</NButton>
				</NPopselect>
				<NPopselect v-model:value="formData.model" :options="modelOptions" trigger="click"
										:on-update:value="(value)=>{formData.model = value;formData.Count = 1}">
					<NButton>{{ modelOptions.find(i => i.value === formData.model)?.label || '请选择模型' }}</NButton>
				</NPopselect>
				<HoverButton @click="showModal = true">
					<span class="text-xl text-[#4f555e] dark:text-white">
						<NPopover trigger="hover">
							<template #trigger>
							<SvgIcon icon="ri:settings-4-line" />
							</template>
							<span>或许不想知道你的花园长得咋样</span>
						</NPopover>
					</span>
				</HoverButton>
				<HoverButton @click="history">
					<span class="text-xl text-[#4f555e] dark:text-white">
						<NPopover trigger="hover">
							<template #trigger>
							<SvgIcon icon="ri:file-user-line" />
							</template>
							<span>会话历史</span>
						</NPopover>
					</span>
				</HoverButton>
			</SubmitFooter>
		</div>


		<NModal v-model:show="showModal" style="width: 90%; max-width: 600px;" preset="card">
			<NForm
						 label-placement="left"
						 label-width="auto"
						 require-mark-placement="right-hanging">
				<NFormItem label="反向提示词" path="negativePrompt">
					<NInput v-model:value="formData.negativePrompt"></NInput>
				</NFormItem>
				<NFormItem label="生成图片数量" >
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
	NPopselect,NCard,NPopover,NTabs,NTabPane,NPagination
} from "naive-ui";
import {onMounted, reactive, ref} from "vue";
import axios from 'axios';
import {useAuthStoreWithout} from '@/store/modules/auth'
import {useSignalR} from '@/views/chat/hooks/useSignalR';
import SubmitFooter from "@/components/common/SubmitFooter/submitFooter.vue";
import {HoverButton,SvgIcon} from '@/components/common'
import {MyImageList } from '@/api';
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

const page = ref(1);
const pageSize = ref(10);
const totalPage = ref(0);


const ms = useMessage();
//signalR
const {waitingCount, connection, imgUrl} = useSignalR(apiBaseUrl + '/graphhub');

type SubmitDTO = {
	negativePrompt: string
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
	negativePrompt: authStore.imgKey ?? "",
	modelType: 1,
	connectionId: null,
	model: null
})


const submit = async () => {
	if (!connection.value) {
		ms.warning('页面已失效，请刷新页面！');
		return;
	}
	formData.connectionId = connection.value?.connectionId
	try {
		authStore.setImgKey(formData.negativePrompt);
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
		totalPage.value=0;

	} catch (error) {
		console.log(`请求失败：${error}`);
		ms.error('报错拉！：' + error);
	}
	console.log("提交的参数：", formData); // 在控制台输出提交的参数
};

const history = async () => {
  // 设置请求头
  const { data } = await MyImageList(null, 1, 10);
  if (data.items != null) {
    let imaglist: string[] = [];
    data.items.forEach((m: any) => {
      imaglist.push(m.imagUrl);
    });
    imgUrl.value = imaglist as never[];
	page.value=1;
	totalPage.value=Math.ceil(data.total/10);
  }
}
const loadPosts =async () => {
	const { data } = await MyImageList(null,  page.value, pageSize.value);
  if (data.items != null) {
    let imaglist: string[] = [];
    data.items.forEach((m: any) => {
      imaglist.push(m.imagUrl);
    });
    imgUrl.value = imaglist as never[];
	totalPage.value=Math.ceil(data.total/pageSize.value);
  }
};
const updatePage = (p: number) => {
    page.value = p;
    loadPosts();
};
onMounted(() => {
    loadPosts();
});
</script>
