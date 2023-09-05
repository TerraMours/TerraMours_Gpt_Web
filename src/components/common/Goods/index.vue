<script setup lang='ts'>
import { NBadge, NButton, NCard, NH1, NH3, NImage, NModal, NNumberAnimation, NStatistic, NTabPane, NTabs, useMessage } from 'naive-ui'
import { computed, onMounted, reactive, ref } from 'vue'
import VueQrcode from 'vue-qrcode'
import type { HubConnection } from '@microsoft/signalr'
import { HubConnectionBuilder } from '@microsoft/signalr'
import { SvgIcon } from '..'
import type { Product } from '@/api'
import { GetAllProductList, PreCreate } from '@/api'
const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const apiUrl = import.meta.env.VITE_GLOB_API_URL

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const showModal = ref(false)
const goodList = ref<Product[]>([])

const goodPrice = ref(0)
const totpUrl = ref('')
const currentOderId = ref('')
const ms = useMessage()
// signalr
const connection = ref<HubConnection | null>(null)
const show = computed({
  get() {
    return props.visible
  },
  set(visible: boolean) {
    emit('update:visible', visible)
  },
})

const getAllGoods = () => goodList.value

const getTabList = computed(() => {
  const typeSet = new Set(goodList.value.map(good => good.categoryName))
  return ['全部', ...Array.from(typeSet)]
})

function getGoodsByType(type: string | '全部'): Product[] {
  if (type === '全部')
    return getAllGoods()

  return goodList.value.filter(good => good.categoryName === type)
}

const getAllProductList = async () => {
  const { data } = await GetAllProductList()
  if (data != null)
    goodList.value = data
}

const payModel = async (good: Product) => {
  goodPrice.value = good.price
  showModal.value = true

  const { data } = await PreCreate(good.name, good.price, good.description, good.categoryId, good.isVIP, good.vipLevel, good.vipTime)
  if (data != null) {
    totpUrl.value = data.qr_code
    currentOderId.value = data.out_trade_no
    const req = reactive({ outTradeNo: data.out_trade_no, TradeNo: null })
    connection.value?.invoke('QueryPaymentStatus', req)
  }
}

const signalConnect = async () => {
  connection.value = new HubConnectionBuilder().withUrl(`${apiUrl}/Hubs/QueryPaymentStatus`)
    .withAutomaticReconnect().build()
  await connection.value.start()
}
onMounted(async () => {
  getAllProductList()
  await signalConnect()
  connection.value?.on('QueryPaymentStatus', (data: { outTradeNo: string; tradeStatus: string }) => {
    if (data.outTradeNo === currentOderId.value) {
      if (data.tradeStatus === 'TRADE_SUCCESS')
        ms.success(`充值成功！成功成功充值￥${goodPrice.value}`)

      else
        ms.warning('未付款交易超时关闭.请重新购买')

      showModal.value = false
    }
  })
})
</script>

<template>
  <div>
    <NModal v-model:show="show" :auto-focus="false" preset="card" style="width: 95%;max-width:900px;max-height:900px;overflow: auto;">
      <NTabs type="segment">
        <NTabPane v-for="(tab, index) in getTabList" :key="index" :name="tab" :tab="tab">
          <template v-for="(good) in getGoodsByType(tab)">
            <NBadge :value="good.discount" style="margin-right: 10px;max-width: 200px; justify-content: space-between;">
              <NCard :title="good.name" shadow="hover" hoverable style="max-width: 300px;">
                <template #cover>
                  <NImage  width="200" height="200" :src="good.imagePath as string" :intersection-observer-options="{ root: '#image-scroll-container' }" />
                </template>
                <NStatistic tabular-nums>
                  <NNumberAnimation :from="0.0" :to="good.price" :precision="1" />
                  <template #prefix>
                    ￥
                  </template>
                </NStatistic>
                <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
                  <NButton strong round size="large" type="primary" @click="payModel(good)">
                    <template #icon>
                      <SvgIcon class="text-xl" icon="ri:link" />
                    </template>
                    立即充值
                  </NButton>
                </div>
              </NCard>
            </NBadge>
          </template>
        </NTabPane>
      </NTabs>
    </NModal>
    <NModal v-model:show="showModal" style="width: 90%; max-width: 600px; " preset="card">
      <NH1 style="text-align: center">
        扫码支付
      </NH1>
      <NH3 style="text-align: center">
        支付方式：请打开支付宝扫码支付！有效期3分钟
      </NH3>
      <div style="display: flex;justify-content: center;align-items: center;">
        <VueQrcode :color="{ dark: '#000', light: '#FFF' }" type="image/webp" :quality="1" :value="totpUrl" class="w-48 h-48 !max-w-[none]" />
      </div>
      <NH3 style="text-align: center">
        需要支付金额：{{ goodPrice }}
      </NH3>
    </NModal>
  </div>
</template>
