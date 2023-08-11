import { onMounted, onUpdated } from 'vue'
import { copyText } from '@/utils/format'

export function useCopyCode() {
  function copyCodeBlock() {
    const codeBlockWrapper = document.querySelectorAll('.code-block-wrapper')
    codeBlockWrapper.forEach((wrapper) => {
      const copyBtn = wrapper.querySelector('.code-block-header__copy')
      const codeBlock = wrapper.querySelector('.code-block-body')
      if (copyBtn && codeBlock) {
        copyBtn.addEventListener('click', async () => {
          if (navigator.clipboard?.writeText)
            await navigator.clipboard.writeText(codeBlock.textContent ?? '')
          else
            copyText({ text: codeBlock.textContent ?? '', origin: true })
        })
      }
    })
  }

  onMounted(() => copyCodeBlock())

  onUpdated(() => copyCodeBlock())
}
