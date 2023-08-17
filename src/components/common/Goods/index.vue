<template>
  <div>
  <NModal v-model:show="show" :auto-focus="false" preset="card" style="width: 95%;max-width:900px;max-height:900px;overflow: auto;">
    <NTabs type="segment">
      <NTabPane v-for="(tab, index) in getTabList" :name="tab" :tab="tab" :key="index">
        <template v-for="(good) in getGoodsByType(tab)">
          <NBadge :value="good.discount" style="margin-right: 10px;max-width: 200px; justify-content: space-between;">
            <NCard :title="good.name" shadow="hover" hoverable style="max-width: 300px;">
              <template #cover>
                <NImage width="200" height="200" :src="(good.url as string)" :intersection-observer-options="{ root: '#image-scroll-container' }"></NImage>
              </template>
              <NStatistic tabular-nums>
                <NNumberAnimation :from="0" :to="good.price" />
                <template #prefix>￥</template>
              </NStatistic>
              <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
                <NButton strong round size="large" type="primary"  @click="payModel(good)">
                  <template #icon>
                    <SvgIcon class="text-xl" icon="ri:link" />
                  </template>
                  立即开通
                </NButton>
              </div>
            </NCard>
          </NBadge>
        </template>
      </NTabPane>
    </NTabs>
  </NModal>
   <NModal v-model:show="showModal" style="width: 90%; max-width: 600px; " preset="card">
        <NH1 style="text-align: center">扫码支付</NH1>
              <NH3 style="text-align: center">支付方式：请打开APP扫码支付！有效期5分钟</NH3>
                <div style="display: flex;justify-content: center;align-items: center;">
                    <vue-qrcode :color="{ dark: '#000', light: '#FFF' }" type="image/webp" :quality="1" :value="totpUrl" class="w-48 h-48 !max-w-[none]" />
                </div>
              <NH3 style="text-align: center">需要支付金额：{{ goodPrice }}</NH3>
      </NModal>
      </div>
  </template>
  <script setup lang='ts'>
  import { NModal,NTabs,NTabPane,NBadge,NCard,NButton,NImage,NNumberAnimation,NStatistic,NH3,NH1} from 'naive-ui'
  import { computed,ref,onMounted } from 'vue'
  import { SvgIcon } from '..'
  import {GetAllProductList,Product,PreCreate} from '@/api'
  import VueQrcode from 'vue-qrcode'
  
  interface Props {
    visible: boolean
  }
  
  interface Emit {
    (e: 'update:visible', visible: boolean): void
  }
  
  const props = defineProps<Props>()
  
  const emit = defineEmits<Emit>()
  
  const showModal = ref(false)
  const goodList=ref<Product[]>([]);
  
  const goodPrice=ref(0)
  const totpUrl=ref('')

  const show = computed({
    get() {
      return props.visible
    },
    set(visible: boolean) {
      emit('update:visible', visible)
    },
  })
  
  const getAllGoods = () => goodList.value;
  
  const getTabList = computed(() => {
    const typeSet = new Set(goodList.value.map(good => good.name));
    return ['全部', ...Array.from(typeSet)];
  });
  
  function getGoodsByType(type: string | '全部'): Product[] {
    if (type === '全部') {
      return getAllGoods();
    }
    return goodList.value.filter(good => good.name === type);
  }
  
  const getAllProductList=async()=>{
    const { data } =await GetAllProductList();
    if (data != null) {
      goodList.value=data;
    }
  }

  const payModel=async(good:Product)=>{
    goodPrice.value=good.price;
    showModal.value=true;

    const { data } =await PreCreate(good.name,good.price,good.description,good.categoryId);
    if (data != null) {
      totpUrl.value=data.qr_code;
    }
  }
  onMounted(() => {
  getAllProductList();
  })
  </script>