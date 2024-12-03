import SparkMD5 from 'spark-md5'
import { FileStatus, UploadFileType } from '@/views/upload/constants'
import { bigFileStandardSize } from '@/views/upload/hooks/useInit'
export * from './localCache'
export * from './concurRequest'

export function isBoolean(value) {
	return typeof value === 'boolean'
}

export function isString(value) {
	return typeof value === 'string'
}

export function isNumber(value) {
	return typeof value === 'number'
}

export function isFunction(value) {
	return typeof value === 'function'
}

export function isObject(value) {
	return typeof value === 'object' && value !== null
}

export function isImageFileType(type) {
	return type.indexOf('image') === -1 ? false : true
}

export const extend = Object.assign

export const isArray = Array.isArray

const hasOwnProperty = Object.prototype.hasOwnProperty

export const hasOwn = (value, key) => {
	return hasOwnProperty.call(value, key)
}

export const hasChanged = (a, b) => {
	return !Object.is(a, b)
}

export const isPromise = val => {
	return isObject(val) && isFunction(val.then)
}

export const convertFileSize = sizeInBytes => {
	if (sizeInBytes < 0) {
		throw new Error('文件大小不能为负数')
	}

	const units = ['B', 'KB', 'MB', 'GB', 'TB']
	let index = 0

	while (sizeInBytes >= 1024 && index < units.length - 1) {
		sizeInBytes /= 1024
		index++
	}

	return `${sizeInBytes.toFixed(2)} ${units[index]}`
}

export const formatFile = file => {
	const names = file.name.split('.')
	const type = names.pop()
	const filename = names.join('.')

	return {
		// 文件名
		name: filename,
		// 当前上传大小
		currentUploadSize: 0,
		// 文件总大小
		size: file.size,
		// 文件类型
		type,
		// 文件上传进度
		progress: 0,
		status: FileStatus.INIT,
		raw: file,
		fileMode: UploadFileType.FORM_DATA,
		// 文件id-即当前文件hash
		fileId: '',
		// 存储剩余需要上传的分片数据
		chunkDataList: [],
		// 表示大文件上传时，中途进行了暂停，暂停后会将剩余的任务存储起来
		taskChunks: [],
		// 是否是大文件
		isBigFile: checkFileSize(file, bigFileStandardSize)
	}
}

/**
 * 获取文件chunk的hash数组
 * @param {File} file 文件数据
 * @param {Number} chunkSize 每次读取的文件大小
 */
export const getNeedFileChunks = (file, chunkSize = 2 * 1024 * 1024) => {
	if (!file) return
	// 获取分片
	const chunks = createChunks(file, chunkSize)
	// 分片数量
	const chunkCount = chunks.length
	// 获取运行线程的逻辑处理器数量
	const threadCount = navigator.hardwareConcurrency || 4
	// 计算每个线程平均需要处理的分片数量
	//  - 当分片数量小于线程数量时，就会导致算出的每个线程处理的分片数量为小于 1，所以这里需要强制改为 1
	//  - 而改为 1 就会导致后续线程根本不会全部执行。所以后面要额外处理一下索引
	const threadChunkCount = Math.ceil(chunkCount / threadCount)
	// 存储每个线程计算出来的 hash
	const threadHashList = []

	let currentOpenThreads = 0
	return new Promise((resolve, reject) => {
		// 将文件按照线程数量进行分片
		function cutFileByThread(i) {
			if (i < threadCount) {
				currentOpenThreads = i
				const start = i * threadChunkCount
				// 取最小值，防止越界
				const end = Math.min(start + threadChunkCount, chunkCount)

				// 获取当前线程需要处理的分片内容
				const curChunks = chunks.slice(start, end)
				// 如果本次的 chunk 的长度为 0，表示后续没有需要额外处理的分片，直接返回
				if (curChunks.length === 0) {
					// 走到这里表示不需要再处理了，同时 currentOpenThreads 也多加了一次，所以需要减去 1
					currentOpenThreads--
					return
				}

				// 利用 worker 处理分片内容
				const worker = new Worker('/src/utils/hashWorker.js')
				// 发送分片内容给 worker
				worker.postMessage({ chunks: curChunks, i, start, end })
				// 监听 worker 返回的结果
				worker.onmessage = e => {
					// e.data 是一个数组，数组中的每一项表示一个包装的chunk数据
					threadHashList[i] = e.data

					// 释放 worker
					worker.terminate()

					const len = threadHashList.filter(Boolean).length

					if (len - 1 === currentOpenThreads) {
						resolve(threadHashList)
					}
				}
				// 监听 worker 错误
				worker.onerror = e => {
					console.log(`worker error【${i}】: `, e)
				}

				// 递归调用，处理下一个线程
				cutFileByThread(i + 1)
			} else {
				return
			}
		}
		cutFileByThread(0)
	})
}

export async function calcFileHashId(file, maxSize = 30 * 1024 * 1024) {
	// 检测当前文件是否大于 30m。如果大于 30m，则提取前 30m 的内容进行计算
	const fileContent = checkFileSize(file, maxSize) ? file.slice(0, maxSize) : file
	const hash = await computedChunksHash([fileContent])
	return hash
}

/**
 * 检测当前文件是否超出指定大小限制
 */
export function checkFileSize(file, maxSize) {
	// 如果大于则表示超出了
	if (file.size > maxSize) {
		return true
	}
	return false
}

export function computedChunksHash(chunks) {
	const spark = new SparkMD5.ArrayBuffer()
	const fileReader = new FileReader()
	let currentChunk = 0

	return new Promise((resolve, reject) => {
		function loadNext() {
			if (currentChunk >= chunks.length) {
				// 解析完成
				const hash = spark.end()
				resolve(hash)
				return
			}
			// 获取本次要处理的文件块
			const file = chunks[currentChunk]
			currentChunk++
			// 等待读取
			fileReader.onload = function (e) {
				// 进行增量计算
				spark.append(e.target.result)
				loadNext()
			}
			// 读取文件块
			fileReader.readAsArrayBuffer(file)
		}
		loadNext()
	})
}

/**
 * 创建文件分片
 * @param {File} file 文件数据
 * @param {Number} chunkSize 每次读取的文件大小
 */
export function createChunks(file, chunkSize) {
	const chunks = []
	for (let i = 0; i < file.size; i += chunkSize) {
		const chunk = file.slice(i, i + chunkSize)
		chunks.push(chunk)
	}
	return chunks
}
