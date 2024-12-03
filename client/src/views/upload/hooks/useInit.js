import { computed, reactive, ref } from 'vue'
import { FileStatus } from '../constants'

export const fileInputRef = ref()
// 文件队列
export const fileQueue = reactive([])
// 同一时刻最多上传文件数
export const maxUploadCount = 2
// 存储等待上传的文件队列
export const awaitUploadFileQueue = []
// 大文件标准大小
export const bigFileStandardSize = 1024 * 1024 * 50

// 当前上传中的文件数量是否达到上限
export const isMaxUploadCount = computed(() => {
	const count = fileQueue.filter(item => {
		return item.status === FileStatus.UPLOADING || item.status === FileStatus.LOADING
	}).length
	return count >= maxUploadCount
})

/**
 * 清空等待上传的文件队列
 */
export const clearAwaitUploadFileQueue = () => {
	awaitUploadFileQueue.splice(0, awaitUploadFileQueue.length)
}

/**
 * 将文件加入等待上传的文件队列
 */
export const addAwaitUploadFileQueue = file => {
	// 如果已经在等待上传的文件队列中，则不再加入
	if (awaitUploadFileQueue.includes(file)) {
		return
	}
	awaitUploadFileQueue.push(file)
}

/**
 * 移除等待上传的文件队列中的某个文件
 */
export const removeAwaitUploadFileQueue = file => {
	const index = awaitUploadFileQueue.findIndex(item => item === file)
	if (index !== -1) {
		awaitUploadFileQueue.splice(index, 1)
	}
}

// 上传成功的文件数量
export const successCount = computed(() => {
	return fileQueue.filter(item => item.status === FileStatus.SUCCESS).length
})

// 上传失败的文件数量
export const errorCount = computed(() => {
	return fileQueue.filter(item => item.status === FileStatus.FAIL).length
})

// 上传文件总数量
export const totalCount = computed(() => {
	return fileQueue.length
})
