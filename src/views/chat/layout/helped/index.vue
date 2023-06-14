<script setup lang='ts'>
import {NLayoutSider} from 'naive-ui'
import RightHead from './RightHead.vue'
import Advertisement from './Advertisement.vue'
import Donator from './Donator.vue'
import {useBasicLayout} from "@/hooks/useBasicLayout";

const {isMobile} = useBasicLayout()

</script>

<template>
	<NLayoutSider
		v-if="!isMobile"
		collapse-mode="width"
		:collapsed-width="0"
		:width="240"
		:native-scrollbar="true"
		show-trigger="bar"
		bordered>
		<div class="h-full flex flex-col justify-between">
			<RightHead/>
			<Advertisement/>
			<Donator/>
		</div>
	</NLayoutSider>

</template>

