<template>
    <div>
        <NModal v-model:show="show" :auto-focus="false" preset="card" style="width: 95%;max-width:900px;max-height:900px;overflow: auto;">
            <NTabs type="segment">
                <NTabPane v-for="(tab, index) in getTabList" :name="tab" :tab="tab" :key="index">
                <template v-for="(good) in getGoodsByType(tab)">
                    <NBadge :value="good.discount as string" style="margin-right: 10px;max-width: 200px; justify-content: space-between;">
                        <NCard :title="good.name" shadow="hover" hoverable style="max-width: 300px;" @click="toggleSelection(good)">
                            <template #cover>
                            <NImage width="200" height="200" :src="good.url" :intersection-observer-options="{ root: '#image-scroll-container' }"></NImage>
                            </template>
                            <NStatistic tabular-nums>
                            <NNumberAnimation :from="0" :to="good.price" />
                            <template #prefix>￥</template>
                            </NStatistic>
                            <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
                            <NButton strong round size="large" type="primary" @click="showModal = true">
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
                <NImage  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAIAAAAiOjnJAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEAklEQVR4nO3dzW6bKxRA0Ta67//IUYeVPEDlwub7yVrT1I5TbaETgvHv7+/vX7Db19UvgHcSFglhkRAWCWGREBYJYZEQFglhkRAWCWGREBYJYZEQFglhkRAWCWGREBYJYZEQFglhkRAWCWGREBYJYZEQFon/tj/j19ehWKcuB/h4VR+PnXrN48d2z9wprlmwYpEQFglhkRAWif3D+4eNg+F4mB0P0WMrvwdMfXXjaL/iwK8FViwSwiIhLBLCIpEP7x+6cXX8j8dfnRr8V3beN07NVw3+/8iKRUJYJIRFQlgkTg/vnY3D7NTu+cos/+KPBbFikRAWCWGREBaJ9wzvK2Pyyiy/8cz7m/zQH5uasEgIi4SwSJwe3ru95qkxeWWmXnnsxo34m+/aW7FICIuEsEgIi0Q+vF+19bzxNMtN9taftYn/pNfKgwiLhLBICIvE75tv4P5vx97PubJ7/uIj8FYsEsIiISwSwiJx63veN+5xTz3VVW9YveqrBSsWCWGREBYJYZE4vfN+1Z0w3WzbXew+5W47/lYsEsIiISwSwiJx8W0zGzfEj72Mlae6yWl6O+88lbBICIuEsEjs33nfOJBu/GSlsamnOrbVfuwPDwUrFglhkRAWCWGRuNexmZVpfeXXgptcibNi5T+2YMUiISwSwiIhLBIPvm2mG1dXNuJXtstXOPPOjyAsEsIiISwSp+95XznO0b2tdMrKp0EdO0Q0fqxjMzyVsEgIi4SwSDx4533KxuM6Y1Pj+bHtcmfeeQlhkRAWCWGReNIbVrtBeMrGHfCNnHnnRxAWCWGREBaJfHgfu8k7No9tah+7m/7yz2yyYpEQFglhkRAWifzM+3hs7M68b3zD6tjGPw8c+wEdm+GphEVCWCSEReL0hzRNzfJTjx3rjtxcddvM+Pu65513EhYJYZEQFonTZ96nHjt2kxPx97wy/qrDS39fwPZnhF/CIiIsEsIi8Z7bZjZOzY+4BOaqn/cfWbFICIuEsEgIi8T+YzPHtp67I+FjG98puvKNprhthpcQFglhkRAWidNvWF1xz1sYu1l+6ie62wWWViwSwiIhLBLCInH6DavdWexjQ/TGvfUPx97OeuCvI1YsEsIiISwSwiJxeng/ZmW7fOofd7ddrryM8WMPsGKREBYJYZEQFonXDu9jUwP4xjH5Jtv0rorkqYRFQlgkhEXi4nvej32j7m6WqQ3xY5dQXn6BpRWLhLBICIuEsEjk97x3upvNjx0Yv+pjYA+wYpEQFglhkRAWiffc886tWLFICIuEsEgIi4SwSAiLhLBICIuEsEgIi4SwSAiLhLBICIuEsEgIi4SwSAiLhLBICIuEsEgIi4SwSAiLhLBICIuEsEj8AY6mLJa9C+atAAAAAElFTkSuQmCC"/>
            </div>
            <NH3 style="text-align: center">需要支付金额：7</NH3>
		</NModal>
    </div>
</template>
<script setup lang='ts'>
import { NModal,NTabs,NTabPane,NBadge,NCard,NButton,NImage,NNumberAnimation,NStatistic,NH3,NH1} from 'naive-ui'
import { computed,ref } from 'vue'
import { SvgIcon } from '..'
interface Good {
  id: number;
  url: string;
  name: string;
  price: number;
  discount: string|null;
  isSelected: boolean;
  type: string;
}

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const showModal = ref(false)

const goodList: Good[] =[{
    id:1,
    url:'https://sp.terramours.site/uploads/images/1ddbca3794d85518218beb5e5fabe4b2.png',
    name:'年度会员',
    price:168,
    discount:'7.5折',
    isSelected: false,
    type:'会员',
},{
    id:2,
    url:'https://api.terramours.site/dfda6d91-e463-4972-9094-c44ee8a46005.png',
    name:'季度会员',
    price:68,
    discount:null,
    isSelected: false,
    type:'会员',
},{
    id:3,
    url:'https://sp.terramours.site/uploads/images/1ddbca3794d85518218beb5e5fabe4b2.png',
    name:'月度会员',
    price:25,
    discount:null,
    isSelected: false,
    type:'会员',
},{
    id:3,
    url:'https://api.terramours.site/dfda6d91-e463-4972-9094-c44ee8a46005.png',
    name:'月度会员',
    price:25,
    discount:null,
    isSelected: false,
    type:'会员1',
},{
    id:3,
    url:'https://api.terramours.site/dfda6d91-e463-4972-9094-c44ee8a46005.png',
    name:'月度会员',
    price:25,
    discount:null,
    isSelected: false,
    type:'会员1',
},{
    id:3,
    url:'https://api.terramours.site/dfda6d91-e463-4972-9094-c44ee8a46005.png',
    name:'月度会员',
    price:25,
    discount:null,
    isSelected: false,
    type:'会员2',
},{
    id:3,
    url:'https://api.terramours.site/dfda6d91-e463-4972-9094-c44ee8a46005.png',
    name:'月度会员',
    price:25,
    discount:null,
    isSelected: false,
    type:'会员2',
}]

const show = computed({
  get() {
    return props.visible
  },
  set(visible: boolean) {
    emit('update:visible', visible)
  },
})

const getAllGoods = () => goodList;

const getTabList = computed(() => {
  const typeSet = new Set(goodList.map(good => good.type));
  return ['全部', ...Array.from(typeSet)];
});

function getGoodsByType(type: string | '全部'): Good[] {
  if (type === '全部') {
    return getAllGoods();
  }
  return goodList.filter(good => good.type === type);
}

const toggleSelection = (good: Good): void => {
  good.isSelected = !good.isSelected;
}
</script>