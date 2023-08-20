<template>
		<div class="h-full dark:bg-[#24272e] transition-all" :class="[isMobile ? 'p-0' : 'p-4']">
			<div class="h-full" :class="getMobileClass">
				<NLayout class="z-40 transition h-full" has-sider>
					<Sider/>
					<NLayoutContent>
						<NLayout has-sider sider-placement="right" style="height: 100%;">
							<NLayoutContent content-style="padding:12px">
								<NTabs type="line" animated v-model:value="selectedTab" @update:value="handleTabChange">
									<NTabPane name="AI聊天" tab="AI聊天">
										<div class="scrollable">
											<RouterView v-slot="{ Component, route }">
												<component :is="Component" :key="route.fullPath"/>
											</RouterView>
										</div>
									</NTabPane>
									<NTabPane name="AI绘图" tab="AI绘图">
										<div class="scrollable">
											<ImageView/>
										</div>
									</NTabPane>
								</NTabs>
							</NLayoutContent>
							<!-- <Helped/> -->
						</NLayout>
					</NLayoutContent>

				</NLayout>
			</div>
			<!-- <Permission :visible="needPermission"/> -->
		</div>
</template>

<script setup lang='ts'>
import {computed, ref} from 'vue'
import {NLayout, NTabs, NTabPane, NLayoutContent} from 'naive-ui'
import {useRouter} from 'vue-router'
import Sider from './sider/index.vue'
// import Helped from './helped/index.vue'
// import Permission from './Permission.vue'
import ImageView from './image/index.vue'
import {useBasicLayout} from '@/hooks/useBasicLayout'
import { useChatStore} from '@/store'

const router = useRouter()
const chatStore = useChatStore()

router.replace({name: 'Chat', params: {uuid: chatStore.active}})


const {isMobile} = useBasicLayout()

const selectedTab = ref("AI聊天");
const cachedTab = localStorage.getItem("selectedTab"); // 获取之前缓存的 tab

if (cachedTab) {
	selectedTab.value = cachedTab; // 如果有缓存，设置当前选中的 tab 为缓存的 tab
}

// 当前选中的 tab 发生变化时，缓存选中的 tab
function handleTabChange(tab: string) {
	selectedTab.value = tab;
	localStorage.setItem("selectedTab", tab);
}


const getMobileClass = computed(() => {
	if (isMobile.value)
		return ['rounded-none', 'shadow-none']
	return ['border', 'rounded-md', 'shadow-md', 'dark:border-neutral-800']
})


</script>

<style scoped>
.scrollable {
	height: calc(100vh - 112px);
	overflow-y: scroll;
}
</style>
