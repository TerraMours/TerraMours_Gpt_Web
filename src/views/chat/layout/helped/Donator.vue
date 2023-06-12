<script setup lang='ts'>
import { ref } from 'vue'
import { NAvatar, NSpace } from 'naive-ui'
const show = ref(false)
const list: any = Array.from({ length: 20 }, () => ({ txt: 'ЮвЪЧдожњеп' }))
</script>

<template>
  <footer class="flex items-center justify-between min-w-0 p-4 overflow-hidden border-t dark:border-neutral-800 donator">
    <NSpace v-if="show" align="flex-end" @click="show = false">
      <span v-for="(item, index) of list" :key="index" round size="small" :src="item.url">{{ item.txt }}</span>
    </NSpace>
    <NAvatar v-else round size="small" src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg" @click="show = true" />
  </footer>
</template>

<style scoped>
.donator{
  max-height: 300px;
  overflow-y: auto;
}
</style>
