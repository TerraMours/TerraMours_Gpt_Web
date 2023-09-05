<script lang="ts" setup>
import {
  NAvatar,
  NBadge,
  NButton,
  NCard,
  NCol,
  NForm,
  NFormItem,
  NImage,
  NInput,
  NModal,
  NPagination,
  NPopover, NPopselect, NRow, NSlider, NStatistic, NSwitch, NTabPane, NTabs, useMessage,
} from 'naive-ui'
import { onBeforeMount, onMounted, reactive, ref } from 'vue'
import { useAuthStoreWithout } from '@/store/modules/auth'
import { useSignalR } from '@/views/chat/hooks/useSignalR'
import SubmitFooter from '@/components/common/SubmitFooter/submitFooter.vue'
import { HoverButton, SvgIcon } from '@/components/common'
import type { SubmitDTO } from '@/api'
import { GenerateGraph, MyImageList, ShareImage, ShareImageList } from '@/api'
// 定义后端接口的地址
const apiUrl = import.meta.env.VITE_GLOB_API_URL
const authStore = useAuthStoreWithout()
const modelTypeOptions: Array<{ label: string; value: number }> = [
  { label: 'CHATGPT', value: 0 },
  { label: 'SD', value: 1 },
]
const modelOptions: Array<{ label: string; value: string }> = [
  { label: '二次元', value: '二次元' },
  { label: '真人', value: '真人' },
]
const selectedTab = ref('chap1')
const showModal = ref(false)

const page = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)

const ms = useMessage()
// signalR
const { waitingCount, connection, imgUrl, start } = useSignalR(`${apiUrl}/graphhub`)

const formData = reactive<SubmitDTO>({
  Prompt: '',
  Count: 1,
  Size: 512,
  negativePrompt: authStore.imgKey ?? '',
  modelType: 1,
  connectionId: null,
  model: null,
})

const submit = async () => {
  if (!connection.value) {
    ms.warning('页面已失效，请刷新页面！')
    return
  }
  formData.connectionId = connection.value?.connectionId
  const { data } = await GenerateGraph(formData)
  ms.success(data)
  // console.log('提交的参数：', formData) // 在控制台输出提交的参数
}

const history = async (tabName: string) => {
  let response
  switch (tabName) {
    case 'chap1':
		  response = await MyImageList(null, 1, 10)
		  break
    case 'chap2':
    default:
		  response = await ShareImageList(null, 1, 10)
		  break
  }
  // 设置请求头
  const { data } = response
  if (data.items != null) {
    imgUrl.value = data.items
    page.value = 1
    totalPage.value = Math.ceil(data.total / pageSize.value)
  }
}

const PublicChange = async (imageRecordId: number, isPublic: boolean) => {
  const { data } = await ShareImage(imageRecordId, isPublic)
  if (data)
    ms.success('操作成功')
}

const loadPosts = async () => {
  let response
  switch (selectedTab.value) {
    case 'chap1':
		  response = await MyImageList(null, page.value, 10)
		  break
    case 'chap2':
    default:
		  response = await ShareImageList(null, page.value, 10)
		  break
  }
  // 设置请求头
  const { data } = response
  if (data.items != null) {
    imgUrl.value = data.items
    totalPage.value = Math.ceil(data.total / pageSize.value)
  }
}
const updatePage = (p: number) => {
  page.value = p
  loadPosts()
}

const changeBoolean = (imageUrl: any) => {
  if (imageUrl.islike == null)
    imageUrl.islike = true

  else
    imageUrl.islike = !imageUrl.islike
}
onMounted(() => {
  loadPosts()
})
onBeforeMount(() => {
  // 在组件加载时调用 start 方法
  start()
})
</script>

<template>
  <div class="h-full relative">
    <NRow>
      <NCol :span="12">
        <NStatistic label="当前队列等待任务数" :value="waitingCount" />
      </NCol>
    </NRow>
    <NTabs v-model:value="selectedTab" type="segment" @update:value="history">
      <NTabPane name="chap1" tab="我的绘画" />
      <NTabPane name="chap2" tab="绘画广场" />
    </NTabs>
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
      <NCard v-for="(imageUrl, index) in imgUrl" :key="index" shadow="hover" style="margin-bottom: 10px;max-width: 300px;" hoverable>
        <template #cover>
          <NImage
            width="512"
            height="512"
            lazy
            :src="imageUrl.imagUrl"
            :intersection-observer-options="{
              root: '#image-scroll-container',
            }"
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
        </template>
        <div style="display: flex; justify-content:space-between; margin-top: 16px;">
          <NSwitch v-if="imageUrl.isPublic !== null" v-model:value="imageUrl.isPublic" @update:value="PublicChange(imageUrl.imageRecordId, imageUrl.isPublic)">
            <template #checked>
              公开
            </template>
            <template #unchecked>
              私有
            </template>
          </NSwitch>
          <div style="display: none; justify-content: end;">
            <NBadge v-model:value="imageUrl.likeCount" style="margin-right: 8px;">
              <NAvatar>
                <SvgIcon icon="ri:thumb-up-fill" class="text-2xl cursor-pointer" :color="{ 'yellow': imageUrl.islike, '': !imageUrl.islike }" @click="changeBoolean(imageUrl)" />
              </NAvatar>
            </NBadge>
            <NBadge v-model:value="imageUrl.likeCount" style="margin-right: 8px;">
              <NAvatar>
                <SvgIcon icon="ri:thumb-down-fill" class="text-2xl cursor-pointer" color="" />
              </NAvatar>
            </NBadge>
            <NBadge value="1">
              <NAvatar>
                <SvgIcon icon="ri:star-fill" class="text-2xl cursor-pointer" />
              </NAvatar>
            </NBadge>
          </div>
        </div>
      </NCard>
    </div>
    <div v-if="totalPage > 0" class="pagination-wrap w-full" style="display: flex; justify-content: center; margin-top: 8px;">
      <NPagination
        :page="page"
        :page-slot="5"
        :page-count="totalPage"
        @update:page="updatePage"
      />
    </div>
    <div class="absolute bottom-0 w-full">
      <SubmitFooter
        v-model="formData.Prompt"
        placeholder="请输入图片描述词"
        :search-options="[]"
        :render-option="null"
        :button-disabled="false"
        :show-token="false"
        :counter="500"
        @submit="submit"
      >
        <NPopselect
          v-model:value="formData.modelType" :options="modelTypeOptions" trigger="click"
          :on-update:value="(value) => { formData.modelType = value;formData.Count = 1 }"
        >
          <NButton>{{ modelTypeOptions.find(i => i.value === formData.modelType)?.label || '请选择模型' }}</NButton>
        </NPopselect>
        <NPopselect
          v-model:value="formData.model" :options="modelOptions" trigger="click"
          :on-update:value="(value) => { formData.model = value;formData.Count = 1 }"
        >
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
        <!-- <HoverButton @click="history">
					<span class="text-xl text-[#4f555e] dark:text-white">
						<NPopover trigger="hover">
							<template #trigger>
							<SvgIcon icon="ri:file-user-line" />
							</template>
							<span>会话历史</span>
						</NPopover>
					</span>
				</HoverButton> -->
      </SubmitFooter>
    </div>

    <NModal v-model:show="showModal" style="width: 90%; max-width: 600px;" preset="card">
      <NForm
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
      >
        <NFormItem label="反向提示词" path="negativePrompt">
          <NInput v-model:value="formData.negativePrompt" />
        </NFormItem>
        <NFormItem label="生成图片数量">
          <NSlider v-model:value="formData.Count" :max="10" :min="1" />
        </NFormItem>
      </NForm>
    </NModal>
  </div>
</template>
