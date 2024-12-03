import { getNeedFileChunks, calcFileHashId, concurRequest, isBoolean, isArray } from '@/utils'
import { reqUploadbigFile, reqMergeFile, reqCheckFile } from '@/apis'
import { useFile } from './useFile'
import { FileStatus } from '../constants'
import { useHandleFileQueue } from './useHandleFileQueue'

const { setFileStatus } = useFile()
const { changeFileStatus } = useHandleFileQueue()

export function useBigFileUpload() {
	/**
	 * 处理大文件上传
	 * @param {object} 包装的文件对象
	 */
	async function processBigFileUpload(file) {
		if (!file) return

		// 上传任务队列
		const requestTaskQueue = []
		let uploadChunks = []
		/**
		 * 生成请求任务
		 */
		function genRequestTask(formData) {
			// 利用闭包保存请求体
			function request() {
				return reqUploadbigFile(formData)
			}
			return request
		}
		/**
		 * 更新上传进度
		 */
		function updateProgress(chunkSize) {
			// 更新当前文件上传大小
			file.currentUploadSize += chunkSize
			// 计算上传进度，不保留小数
			const progress = Math.floor((file.currentUploadSize / file.size) * 100)
			// 如果进度到了 100，则设置为 99，当后续合并请求成功后，再设置为 100
			file.progress = progress >= 100 ? 99 : progress
		}

		// 检测 file 上的 taskChunks 属性是否有值，如果有则使用 taskChunks 属性上的值作为 requestTaskQueue
		if (isArray(file.taskChunks) && file.taskChunks.length > 0) {
			requestTaskQueue.push(...file.taskChunks)

			// 必须重新设置当前 file 的状态
			changeFileStatus(file, FileStatus.UPLOADING)
			// 必须更新 uploadChunks，因为暂停后，requestTaskQueue 是被截取过的，所以这里 uploadChunks 也要对应截取后的值
			uploadChunks = file.chunkDataList

			// 如果存在则无需再次进行分片处理，直接进行上传
			startUpload(requestTaskQueue)
			return
		}

		// 大文件上传的分块处理具有特殊的加载状态
		changeFileStatus(file, FileStatus.LOADING)

		const fileRaw = file.raw

		// 根据当前文件的前 30m 内容计算出标识 hash
		const hashId = await calcFileHashId(fileRaw)
		// 将 hashId 赋值给 file 对象
		file.fileId = hashId

		// 获取已经上传过的分片hash
		const { data } = await reqCheckFile({ fileId: hashId })

		// 如果 data 是一个布尔值且值为 true 表示这个文件已经上传过了，无需再次上传
		//  - 直接将进度设置为 100%，状态设置为成功
		if (isBoolean(data) && data) {
			file.progress = 100
			setFileStatus(file, FileStatus.SUCCESS)
			return
		}

		const uploadedChunks = data || []

		// 获取需要上传的文件分片
		const chunks = await getNeedFileChunks(fileRaw, 2 * 1024 * 1024)
		const flatChunks = chunks.flat(Infinity)

		// 已经上传过的分片大小
		let uploadedChunkSize = 0

		// 过滤已经上传过的分片
		uploadChunks = flatChunks.filter(item => {
			const isExist = uploadedChunks.includes(item.chunkHash)

			// 如果存在，则直接更新当前文件的上传进度
			if (isExist) {
				uploadedChunkSize += item.chunkBlob.size
			}

			return !isExist
		})

		// 如果已经上传过的分片大小大于 0，则更新当前文件的上传进度
		if (uploadedChunkSize > 0) {
			updateProgress(uploadedChunkSize)
		}

		// 分片处理完成后，将状态设置为上传中
		changeFileStatus(file, FileStatus.UPLOADING)

		// 为需要上传的分片进行包装
		for (const chunk of uploadChunks) {
			const formData = new FormData()
			formData.append('chunkBlob', chunk.chunkBlob) // 分片文件内容
			formData.append('chunkHash', chunk.chunkHash) // 分片文件hash
			formData.append('chunkIndex', chunk.chunkIndex) // 分片文件索引
			formData.append('fileId', hashId) // 完整文件的 hash
			formData.append('filename', fileRaw.name) // 完整的文件名
			formData.append('fileSize', fileRaw.size) // 完整的文件大小

			// 加入请求任务队列
			requestTaskQueue.push(genRequestTask(formData))
		}

		startUpload(requestTaskQueue)

		/**
		 * 开始上传
		 */
		function startUpload(taskList) {
			// 进行并发请求任务，最大并发数为 3
			concurRequest(taskList, 3, {
				isPause: () => {
					return file.status === FileStatus.PAUSE
				},
				onPause: i => {
					// 暂停后，截取剩余的任务，并保存到 file.taskChunks 属性上
					file.taskChunks = taskList.slice(i)
					// 同时，也要将 uploadChunks 截取保存到 file.chunkDataList 属性上
					//  - 让暂停后继续上传时，能获取到正确的分片数据，进行进度更新
					file.chunkDataList = uploadChunks.slice(i)
				},
				onSuccess: (res, index) => {
					// 根据索引取出对应的 chunk
					const chunk = uploadChunks[index]
					// 获取当前 chunk 大小
					const chunkSize = chunk.chunkBlob.size

					updateProgress(chunkSize)
				},
				onError: (err, index) => {
					console.log('上传失败', err)
				},
				onComplete: async () => {
					// 发送合并请求
					await reqMergeFile({ fileId: file.fileId })
					// 进度设置为 100
					file.progress = 100

					// 状态设置为成功，来触发后续处理
					setFileStatus(file, FileStatus.SUCCESS)
				}
			})
		}
	}

	return {
		processBigFileUpload
	}
}
