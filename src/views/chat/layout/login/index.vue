<template>
  <div class="relative flex-center wh-full" >
    <NCard :bordered="false" size="large" class="z-4 !w-auto rounded-20px shadow-sm">
      <div class="w-300px sm:w-360px">
        <header class="flex-y-center justify-between">
          <system-logo class="text-64px text-primary" />
          <NGradientText type="primary" :size="28">1</NGradientText>
        </header>
        <main class="pt-24px">
          <h3 class="text-18px text-primary font-medium">1</h3>
          <div class="pt-24px">
            <transition name="fade-slide" mode="out-in" appear>
            </transition>
          </div>
        </main>
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import type {NCard,NGradientText} from 'naive-ui';


</script>

<style scoped></style>
