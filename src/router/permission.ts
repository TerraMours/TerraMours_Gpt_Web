import type {Router} from 'vue-router'
import {useAuthStoreWithout} from '@/store/modules/auth'

export const whiteList = ['/login']

export function setupPageGuard(router: Router) {

	router.beforeEach(async (to, from, next) => {
		const authStore = useAuthStoreWithout()
		//注册和查询余额页面不需要登录验证
		if (!authStore.session && to.path !== '/balance' && to.path !== '/register') {
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
	}
    else {
      next()
    }
	})
}
