import { isFunction } from '.'

/**
 * 并发请求
 * @param {Array} requestTaskQueue 请求任务队列
 * @param {Number} max 最大并发数
 * @param {Object} options 请求完成后的回调函数
 */
export function concurRequest(requestQueue, max, options = {}) {
	const { onComplete, onSuccess, onError, isPause, onPause } = options

	if (!requestQueue.length) {
		onComplete && onComplete([])
		return
	}

	const maxTaskCount = requestQueue.length
	// 存储请求结果
	const result = []
	let i = 0

	return new Promise((resolve, reject) => {
		function run() {
			// 索引大于或者等于最大任务数量时表示所有请求都发送完成了，停止 run 执行
			if (i >= maxTaskCount) {
				return
			}
			// 若传递的 isPause 返回结果为 true。
			if (isFunction(isPause) && isPause()) {
				isFunction(onPause) && onPause(i)
				// 同时停止 Promise
				resolve(result)
				return
			}

			// 存储当前任务索引
			const index = i

			// 获取请求任务
			const task = requestQueue[index]
			task()
				.then(res => {
					// 存储请求结果
					result[index] = res || true
					onSuccess && onSuccess(res, index)
				})
				.catch(err => {
					// 存储请求结果
					result[index] = err
					onError && onError(err, index)
				})
				.finally(() => {
					// 开启下一次请求
					run()

					// 如果 result 中有 undefined，则表示请求还未完成，因此进行过滤
					// 当过滤后的 result 长度等于请求任务队列的长度时，表示所有请求都完成了
					const len = result.filter(Boolean).length
					// 如果 len 经过过滤之后等于请求任务队列的长度，则表示所有请求都完成了
					if (len === maxTaskCount) {
						resolve(result)
						onComplete && onComplete(result)
					}
				})
			// 更新索引
			i++
		}

		// 开启第一波并发请求
		//  - 防止任务队列数量小于最大并发数时，导致任务执行异常
		while (i < max && i < maxTaskCount) {
			run()
		}
	})
}
