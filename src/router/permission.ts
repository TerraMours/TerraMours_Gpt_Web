import type {Router} from 'vue-router'
import {useAuthStoreWithout} from '@/store/modules/auth'

export const whiteList = ['/login']

export function setupPageGuard(router: Router) {
	console.log(router)

	router.beforeEach(async (to, from, next) => {
		const authStore = useAuthStoreWithout()
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
