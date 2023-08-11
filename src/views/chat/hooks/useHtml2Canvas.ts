import html2canvas, {Options} from 'html2canvas'


export function downloadHtml2Canvas(element: HTMLElement, options?: Partial<Options>) {
	return new Promise<boolean>(async (resolve, reject) => {
		try {
			const canvas = await html2canvas(element, options)
			const imgUrl = canvas.toDataURL('image/png')
			const tempLink = document.createElement('a')
			tempLink.style.display = 'none'
			tempLink.href = imgUrl
			tempLink.setAttribute('download', 'chat-shot.png')
			if (typeof tempLink.download === 'undefined') tempLink.setAttribute('target', '_blank')
			document.body.appendChild(tempLink)
			tempLink.click()
			document.body.removeChild(tempLink)
			window.URL.revokeObjectURL(imgUrl)
			resolve(true)
		} catch (e) {
			reject(e)
		}
	})


}
