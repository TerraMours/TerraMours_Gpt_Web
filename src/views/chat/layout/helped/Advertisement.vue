<script setup lang='ts'>
import { ref } from 'vue'
import { NCard } from 'naive-ui'
const show = ref(true)
</script>

<template>
  <main class="flex-1 items-center justify-between min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800">
    <NCard v-if="show" title="赞助-微信" hoverable :bordered="false" closable @close="show = false">
      <template #default>
        <img src="../../../../assets/vx.jpg">
      </template>
    </NCard>
    <NAvatar v-else round size="small" src="../../../../assets/vx.jpg" @click="show = true" />
  </main>
</template>

<style scoped>
.n-card {
  max-width: 300px;
}

.advertisement {
  font-style: 16px;
  color: #333;
  line-height: 24px;
  margin: 12px 0;
}
</style>
