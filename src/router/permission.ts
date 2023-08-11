import type {Router} from 'vue-router'
import {useAuthStoreWithout} from '@/store/modules/auth'

export const whiteList = ['/login']

export function setupPageGuard(router: Router) {

	router.beforeEach(async (to, from, next) => {
		const authStore = useAuthStoreWithout()
		// 登录态
		if (authStore.token) {
			// 在登录时在地址栏输入login 将不跳转
			if (whiteList.includes(to.path)) {
				next({path: from.path!})
			} else {
				next()
			}
		} else {
			// 如果没有登录
			if (whiteList.includes(to.path)) {
				next()
			} else {
				next({name: 'login'})
			}
		}
	})
}
