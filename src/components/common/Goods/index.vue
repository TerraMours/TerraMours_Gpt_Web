<template>
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
              <NButton strong round size="large" type="primary">
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

</template>
<script setup lang='ts'>
import { NModal,NTabs,NTabPane,NBadge,NCard,NButton,NImage,NNumberAnimation,NStatistic} from 'naive-ui'
import { computed } from 'vue'
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

const goodList: Good[] =[{
    id:1,
    url:'https://api.terramours.site/68a26018-264f-45d2-8d98-f017509c5eff.png',
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
    url:'https://api.terramours.site/dfda6d91-e463-4972-9094-c44ee8a46005.png',
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