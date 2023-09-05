<script lang="ts" setup>
import {computed, defineOptions as defineOptionsFromVue, ref, watch} from 'vue'
import {NAutoComplete, NButton, NInput, NSpace} from 'naive-ui'
import type {AutoCompleteGroupOption, AutoCompleteOption} from 'naive-ui'
import {useBasicLayout} from '@/hooks/useBasicLayout'
import {SvgIcon} from '@/components/common'
import {countTokens} from '@/utils/index'

const props = withDefaults(defineProps<{
	placeholder: string
	searchOptions: Array<string | AutoCompleteOption | AutoCompleteGroupOption>
	svgIcon: string
	modelValue: string
	renderOption: any // 参考naive-ui (info: { node: VNode, option: SelectOption | SelectGroupOption, selected: boolean }) => VNodeChild
	buttonDisabled: boolean
	counter: number
	showToken: boolean
}>(), {
	placeholder: '请输入...',
	svgIcon: 'ri:send-plane-fill',
	modelValue: '',
})
const emits = defineEmits<{
	(event: 'submit', value: string): void
	(event: 'update:modelValue', value: string): void
}>()
defineOptionsFromVue({name: 'submitFooter'})
const {isMobile} = useBasicLayout()
const footerClass = computed(() => {
	if (isMobile.value) {
		return ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-3', 'overflow-hidden']
	}
	return ['p-4']
})

const autoValue = ref<string>(props.modelValue)
watch(() => props.modelValue, () => autoValue.value = props.modelValue)
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

<template>
	<footer :class="footerClass">
		<div class="w-full max-w-screen-xl m-auto">
			<div class="flex items-center justify-between space-x-2">
				<slot/>
				<NAutoComplete :options="props.searchOptions" :render-label="props.renderOption">
					<template #default="{ handleInput, handleBlur, handleFocus }">
						<NInput
							ref="inputRef"
							v-model:value="autoValue"
							type="textarea"
							:placeholder="props.placeholder"
							:autosize="{ minRows: 1, maxRows: isMobile ? 4 : 8 }"
							@input="(value) => { emits('update:modelValue', value);handleInput(value) } "
							@focus="handleFocus"
							@blur="handleBlur"
							@keypress="handleEnter"
							show-count
						>
							<template #count="">
								<NSpace :size="[2,0]">
									<span>token : {{ countTokens(autoValue) }}</span>
								</NSpace>
							</template>
						</NInput>
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

<style scoped>

</style>
