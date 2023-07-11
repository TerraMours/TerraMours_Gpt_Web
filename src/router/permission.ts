import type {Router} from 'vue-router'
import {useAuthStoreWithout} from '@/store/modules/auth'

const whiteList = ['/login']

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
		/*--------------------------------*/
		if (!authStore.session && to.path !== '/balance' && to.path !== '/image') {
			try {
				// const data = await authStore.getSession()
				// if (String(data.auth) === 'false' && authStore.token)
				//   authStore.removeToken()
				if (to.path === '/500')
					next({name: 'Root'})
				else
					next()
			} catch (error) {
				if (to.path !== '/500')
					next({name: '500'})
				else
					next()
			}
		} else {
			next()
		}
	})
}
