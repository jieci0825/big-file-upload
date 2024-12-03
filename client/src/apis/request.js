import { BaseURL } from '@/constants'
import axios from 'axios'

const request = axios.create({
	baseURL: BaseURL
	// timeout: 5000
})

// 响应拦截器
request.interceptors.response.use(res => {
	return res.data
})

export default request
