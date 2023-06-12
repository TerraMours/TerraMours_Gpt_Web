<script setup lang='ts'>
import { ref } from 'vue'
import RightHead from './RightHead.vue'
import Advertisement from './Advertisement.vue'
import Donator from './Donator.vue'

const show = ref(true)
</script>

<template>
  <div class="helpedInfo" :style="show ? 'width:300px' : 'width:1px'">
    <div class="helpedContent">
      <RightHead />
      <Advertisement />
      <Donator />
    </div>
    <div class="fold">
      <img src="../../../../assets/right.svg" alt="折叠" class="fold-img" @click="show = !show">
    </div>
  </div>
</template>

<style scoped>
.helpedInfo {
  border-left: 1px solid #efefef;
  width: 300px;
  max-width: 300px;
  position: relative;
}

.unShow {
  transform: translateX(-300px);
}
.helpedContent{
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.fold {
  width: 30px;
  height:30px;
  border-radius: 50%;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid #efefef;
  background-color: #fff;
}
.fold-img{
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
</style>
