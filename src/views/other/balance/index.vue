<template>
    <div class="container" :style="'background-image: url(' + bgUrl + ')'">
      <div class="content">
        <h1 class="title">查询余额</h1>
        <div class="input-wrap">
            <div class="input-container">
                <NInput placeholder="请输入 key" v-model:value="key" autofocus class="key-input" />
                <NButton type="primary" @click="handleSubmit">查询</NButton>
            </div>
          <div class="loading" v-if="loading">正在加载...</div>
          <div class="error-msg" v-if="errorMsg">{{ errorMsg }}</div>
          <div class="result" v-if="!loading && !errorMsg">
            <div class="result-box">
                <div class="result-title">总额度：</div>
                <div class="result-value">{{ detail.total.toFixed(3) }}</div>
            </div>
            <div class="result-box">
                <div class="result-title">过期时间：</div>
                <div class="result-value">{{ detail.expirationTime }}</div>
            </div>
            <div class="result-box">
                <div class="result-title">使用量：</div>
                <div class="result-value">{{ detail.used.toFixed(3) }}</div>
            </div>
            <div class="result-box">
                <div class="result-title">余额：</div>
                <div class="result-value">{{ detail.unUsed.toFixed(3) }}</div>
            </div>
        </div>
        <!-- 在 .result 元素后添加一个新的 .links 元素 -->
        <div class="result" v-if="!loading && !errorMsg">
        <!-- 省略原有的代码 -->
        </div>
        <div class="links">
        <div>
            <a href="https://sp.terramours.site/" target="_blank">卡密商店：sp.terramours.site</a>
        </div>
        <br>
        <div>
            <a href="https://ai.firstsaofan.top" target="_blank">gpt网站：ai.firstsaofan.top</a>
        </div>
        <br>
        
        <div>Design by TerraMours</div>
        <div>
            <a href="https://github.com/firstsaofan/TerraMours" target="_blank">https://github.com/firstsaofan/TerraMours</a>
        </div>
        </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { NButton, NInput} from "naive-ui";
  import { reactive, ref } from "vue";
  import axios from "axios";
  const bgUrl = 'https://www.firstsaofan.top/upload/2023/04/queryBackground.webp';
  // 定义后端接口的地址
  const apiUrl = import.meta.env.VITE_GLOB_API_URL;
  
  interface ApiResponse {
    status: string;
    data: {
      apiKey: string;
      expirationTime: string;
      used: number;
      unUsed: number;
      total: number;
    };
    message: string;
  }
  
  export default {
    components: {
      NButton,
      NInput,
    },
    setup() {
      const detail = reactive({
        apiKey: "",
        expirationTime: "-",
        used: 0,
        unUsed: 0,
        total: 0,
      });
      const loading = ref(false);
      const errorMsg = ref("");
      const key = ref("");
      const handleSubmit = async () => {
        if (!key.value.startsWith("sk-")) {
            errorMsg.value="无效的API密钥，请检查您的API密钥是否正确。";
            return;
        }
        // 发送 HTTP 请求
        loading.value = true;
        errorMsg.value = "";
        try {
          const resp = await axios.get<ApiResponse>(
            `${apiUrl}/CheckBalance?key=${key.value}`
          );
          if (resp.data.status === "Success") {
            detail.apiKey = resp.data.data.apiKey;
            detail.expirationTime =new Date(resp.data.data.expirationTime).toLocaleDateString();
            detail.used = resp.data.data.used;
            detail.unUsed = resp.data.data.unUsed;
            detail.total = resp.data.data.total;
          } else {
            errorMsg.value = resp.data.message || "发生未知错误";
}
} catch (err:any) {
    errorMsg.value = `查询出错：${err.message}`;
} finally {
loading.value = false;
}
};

return {
  detail,
  loading,
  errorMsg,
  key,
  bgUrl,
  handleSubmit,
};
},
};
</script>

<style scoped>
.container {
  height: 100vh; /* 让根元素高度占满整个浏览器窗口 */
  display: flex; /* 设置为 flex 布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.content {
text-align: center;
width: 100%;
max-width: 800px;
margin: 0 24px;
padding: 24px;
border-radius: 8px;
background-color: rgba(255, 255, 255, 0.8);
box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.1);
}

.title {
font-size: 36px;
margin-bottom: 32px;
}

.input-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-container {
  width: 100%;
  max-width: 800px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.key-input {
  margin-right: 10px;
}


.result {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 32px;
}

.result-box {
  width: 280px;
  margin: 0 16px 24px;
  padding: 16px;
  border-radius: 8px;
  background-color: #f5f5f5;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}

.result-value {
  font-size: 24px;
  color: #007bb5;
}


.loading {
margin-top: 32px;
font-size: 20px;
font-weight: bold;
}

.error-msg {
margin-top: 32px;
font-size: 20px;
font-weight: bold;
color: red;
}
.links {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 32px;
}

.links div {
  font-size: 20px;
  font-weight: bold;
}

.links a {
  font-size: 20px;
  color: #007bb5;
  text-decoration: none;
}

</style>