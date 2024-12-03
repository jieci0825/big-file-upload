import { createRouter, createWebHistory } from 'vue-router'

const routes = [
	{
		path: '/',
		name: 'Home',
		component: () => import(/* webpackChunkName: "app" */ '@/App.vue'),
		redirect: '/upload',
		children: [
			{
				path: 'upload',
				name: 'upload',
				component: () => import(/* webpackChunkName: "upload" */ '@/views/upload/index.vue')
			},
			{
				path: 'resource',
				name: 'resource',
				component: () => import(/* webpackChunkName: "resource" */ '@/views/resource/index.vue')
			}
		]
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

export default router
