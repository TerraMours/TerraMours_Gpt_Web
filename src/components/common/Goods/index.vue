<template>
    <NModal v-model:show="show" :auto-focus="false" preset="card" style="width: 95%; max-width: 640px">
            <NTabs type="segment">
                <NTabPane name="chap1" tab="会员"/>
                <NTabPane name="chap2" tab="超级会员"/>
            </NTabs>
            <NBadge v-for="(good, index) in goodList" :key="index" :value="good.discount" style="margin-right: 10px;max-width: 300px; ">
                <NCard :title="good.name" hoverable size="huge" embedded
                @click="toggleSelection(good)"
                :style="{ border: good.isSelected ? '2px solid red' : '#fff' }">
                    ￥{{ good.price }}
                </NCard>
            </NBadge>
        <div style="display: flex; justify-content: center; margin-top: 24px;">
            <NButton strong round size="large" type="primary">
                立即开通
            </NButton>
        </div>
    </NModal>
</template>
<script setup lang='ts'>
import { NModal,NTabs,NTabPane,NBadge,NCard,NButton} from 'naive-ui'
import { computed } from 'vue'

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const goodList=[{
    id:1,
    name:'年度会员',
    price:168,
    discount:'7.5折',
    isSelected: false
},{
    id:2,
    name:'季度会员',
    price:68,
    isSelected: false
},{
    id:3,
    name:'月度会员',
    price:25,
    isSelected: false
}]

const show = computed({
  get() {
    return props.visible
  },
  set(visible: boolean) {
    emit('update:visible', visible)
  },
})

const toggleSelection=(selectedGood:any)=>{
    goodList.forEach((good) => {
      good.isSelected = good.id === selectedGood.id;
    });
}
</script>