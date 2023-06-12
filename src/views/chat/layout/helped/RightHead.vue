<script setup lang='ts'>
import { ref } from 'vue'
import { NAvatar, NCard } from 'naive-ui'
const show = ref(true)
</script>

<template>
  <header class="flex items-center justify-between min-w-0 p-4 overflow-hidden dark:border-neutral-800">
    <NCard v-if="show" title="赞助-支付宝" hoverable :bordered="false" closable @close="show = false">
      <template #default>
        <img src="../../../../assets/zfb.jpg">
      </template>
    </NCard>

    <NAvatar v-else round size="small" src="../../../../assets/zfb.jpg" @click="show = true" />
  </header>
</template>

<style scoped>
.n-card {
  max-width: 300px;
}
</style>
