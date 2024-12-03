import QS from 'qs'
import request from './request'

/**
 * 上传大文件
 */
export const reqUploadbigFile = data => {
	return request({
		url: '/upload/big-chunk',
		method: 'post',
		data,
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	})
}

/**
 * 发送合并请求
 */
export const reqMergeFile = data => {
	return request({
		url: '/upload/merge',
		method: 'post',
		data
	})
}

/**
 * 检查当前文件是否上传完成
 */
export const reqCheckFile = data => {
	return request({
		url: '/upload/check',
		method: 'post',
		data
	})
}

/**
 * 上传单文件-base64
 */
export const reqUploadSingleBase64 = (data, onUploadProgress) => {
	const controller = new AbortController()
	return {
		controller,
		request: () => {
			return request({
				url: '/upload/single/base64',
				method: 'post',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				// 使用QS.stringify进行编码，防止有些字符乱码
				//  -  即将 JavaScript 对象转换为 URL 编码字符串
				data: QS.stringify(data),
				onUploadProgress
			})
		}
	}
}

/**
 * 上传单文件-form_data
 */
export const reqUploadSingleFormData = (data, onUploadProgress) => {
	const controller = new AbortController()
	return {
		controller,
		request: () => {
			return request({
				url: '/upload/single/form-data',
				method: 'post',
				signal: controller.signal,
				headers: {
					'Content-Type': 'multipart/form-data'
				},
				data,
				onUploadProgress
			})
		}
	}
}

/**
 * 获取资源列表
 */
export const reqResourceList = data => {
	return request({
		url: '/resource/list',
		method: 'post',
		data
	})
}
