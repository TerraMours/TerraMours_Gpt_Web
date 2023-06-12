<template>
  <div  style="padding-top: 64px;">
    <div>
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
        </div>
    <div>
      <h1 style="font-size: 24px;">图片验证码：</h1>
      <NInput
          placeholder="请输入图片验证码"
          v-model:value="verifycationCode"
        />
    </div>
    <div class="flex flex-wrap items-center gap-4">
      <label>模型选择：</label>
          <NSelect
            style="width: 140px"
            v-model:value="modeltype"
            :options="modelOptions"
          />          
        </div>
    <h1 style="font-size: 24px;">图片描述词：</h1>
  <div class="flex items-center justify-between space-x-2">
    <NAutoComplete >
        <NInput
          placeholder="请输入图片描述词,回车可换行"
          ref="inputRef"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 10 }"
          v-model:value="description"
        />
    </NAutoComplete>
    <NButton type="primary" @click="submit">
        生成
    </NButton>
  </div>
  <div v-show="modeltype !== 1">
  <span  style="font-size: 24px;">返回图片数量1-10，本站不保存图片，需要请立即下载。</span>
      <NSpace vertical>
        <NSlider v-model:value="numOfImages" :max="10" :min="1" />
        <NInputNumber v-model:value="numOfImages" size="small" :max="10" :min="1" />
      </NSpace>
  </div>
  <div
    id="image-scroll-container"
    style="
      overflow: auto;
      height: 1000px;
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
</div>
</template>

<script lang="ts">
  import {
    NImage,
    NSelect,
    NAutoComplete,
    NInput,
    NButton,
    NSpace,
    NSlider,
    NInputNumber,
    useMessage,
    NCol,NStatistic,NIcon,NRow
    
  } from "naive-ui";
  import { ref } from "vue";
  import axios from 'axios';
  import { useAuthStoreWithout } from '@/store/modules/auth'
  import {useSignalR} from '@/views/chat/hooks/useSignalR';
  // 定义后端接口的地址
  const apiUrl = import.meta.env.VITE_GLOB_API_URL;
  const apiBaseUrl = import.meta.env.VITE_APP_API_BASE_URL;

  export default {
    components: { NImage, NAutoComplete, NInput, NButton, NSpace, NSlider, NInputNumber,NSelect,NCol,NStatistic,NIcon,NRow },
    setup() {
      const authStore = useAuthStoreWithout();
      const numOfImages = ref(1); // 初始值为1
      const description = ref("");
      const verifycationCode = ref(authStore.imgKey ?? "");
      const modeltype= ref(1);
      const usedCount=ref(0);//已生成图片数量
      const modelOptions: { label: string; value: number }[] = [
      { label: 'CHATGPT',value: 0 },
      { label: 'SD',value: 1 },
    ];
      const ms = useMessage();
      //signalR
      const { waitingCount,connection,imgUrl } = useSignalR(apiBaseUrl+'/graphhub');

      const submit = async () => {
        if (!connection.value) {
          ms.warning('页面已失效，请刷新页面！');
          return;
        }
        const params = {
          Prompt: description.value,
          Count: numOfImages.value,
          SizeType: 1,
          verifycationCode :verifycationCode.value,
          modelType: modeltype.value,
          connectionId:connection.value?.connectionId
        };
      try {
      authStore.setImgKey(verifycationCode.value);
      //signalR
      const response = await axios.post(apiUrl+'/GenerateGraph', params);
      if(response.data.status ==='Fail'){
        ms.error(response.data.message ?? 'error')
      return
      }
      usedCount.value=response.data.data;
      ms.success(response.data.message);

    } catch (error) {
      console.log(`请求失败：${error}`);
      ms.error('报错拉！：'+error);
    }
    console.log("提交的参数：", params); // 在控制台输出提交的参数
  };

      return {
        numOfImages,
        description,
        verifycationCode,
        modeltype,
        modelOptions,
        //signal
        waitingCount,
        imgUrl,
        submit,
        usedCount
      };
    },
  };
</script>
