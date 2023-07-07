<template>
	<footer :class="footerClass">
		<div class="w-full max-w-screen-xl m-auto">
			<div class="flex items-center justify-between space-x-2">
				<slot></slot>
				<NAutoComplete :options="props.searchOptions" :render-label="props.renderOption">
					<template #default="{ handleInput, handleBlur, handleFocus }">
						<NInput
							ref="inputRef"
							v-model:value="autoValue"
							type="textarea"
							:placeholder="props.placeholder"
							:autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }"
							@input="(value)=>{ emits('update:modelValue',value);handleInput(value)} "
							@focus="handleFocus"
							@blur="handleBlur"
							@keypress="handleEnter"
						/>
					</template>
				</NAutoComplete>
				<NButton type="primary" :disabled="props.buttonDisabled" @click="emits('submit', autoValue)">
					<template #icon>
              <span class="dark:text-black">
                <SvgIcon :icon="props.svgIcon"/>
              </span>
					</template>
				</NButton>
			</div>
		</div>
	</footer>


</template>

<script lang="ts" setup>
import {computed, defineOptions as defineOptionsFromVue, ref, watch,withDefaults} from "vue";
import {useBasicLayout} from "@/hooks/useBasicLayout";
import {NButton, NAutoComplete, NInput} from 'naive-ui'
import type {AutoCompleteOption, AutoCompleteGroupOption} from 'naive-ui'
import {SvgIcon} from '@/components/common'

defineOptionsFromVue({name: 'submitFooter'})
const {isMobile} = useBasicLayout()
const footerClass = computed(() => {
	if (isMobile.value) return ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden']
	return ['p-4']
})

const props = withDefaults(defineProps<{
	placeholder: string,
	searchOptions: Array<string | AutoCompleteOption | AutoCompleteGroupOption>,
	svgIcon: string,
	modelValue: string | Record<string, any>,
	renderOption: any //参考naive-ui (info: { node: VNode, option: SelectOption | SelectGroupOption, selected: boolean }) => VNodeChild
	buttonDisabled: boolean
}>(), {
	placeholder: '请输入...',
	svgIcon: 'ri:send-plane-fill',
	modelValue: ''
})
const autoValue = ref<string>(props.modelValue)
watch(() => props.modelValue, () => autoValue.value = props.modelValue)
const emits = defineEmits<{
	(event: 'submit', value: string): void
	(event: 'update:modelValue', value: string): void
}>()


const handleEnter = (event: KeyboardEvent) => {
	if (!isMobile.value) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			emits('submit', autoValue.value)
		}
	} else {
		if (event.key === 'Enter' && event.ctrlKey) {
			event.preventDefault()
			emits('submit', autoValue.value)
		}
	}
}

</script>

<style scoped>

</style>
