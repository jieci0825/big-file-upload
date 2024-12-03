import { isNumber } from '@/utils'
import { fileQueue } from './useInit'

export function useHandleFileQueue() {
	// 清空文件队列
	const clearFileQueue = () => {
		fileQueue.splice(0, fileQueue.length)
	}
	// 删除文件
	const removeFile = value => {
		const index = findFileIndex(value)
		if (index > -1) {
			fileQueue.splice(index, 1)
		}
	}
	// 修改文件状态
	const changeFileStatus = (value, status) => {
		const index = findFileIndex(value)
		if (index > -1) {
			fileQueue[index].status = status
		}
	}
	// 找到文件索引
	function findFileIndex(value) {
		let index = -1
		if (isNumber(value)) {
			index = value
		} else {
			index = fileQueue.findIndex(item => item === value)
		}
		return index
	}

	return {
		clearFileQueue,
		removeFile,
		changeFileStatus
	}
}
