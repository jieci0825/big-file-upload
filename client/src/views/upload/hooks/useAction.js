import { FileStatus } from '../constants'
import { useFile } from './useFile'
import { useHandleFileQueue } from './useHandleFileQueue'
import { clearAwaitUploadFileQueue, fileQueue } from './useInit'

const { setFileStatus } = useFile()
const { clearFileQueue } = useHandleFileQueue()

export function useAction() {
	// 清空队列
	function allClearQueue() {
		// 将所有正在上传的文件都暂停
		allPause()
		// 然后再清空文件队列
		clearFileQueue()
	}

	// 全部暂停
	function allPause() {
		fileQueue.forEach(row => {
			setFileStatus(row, FileStatus.PAUSE)
		})
		// 同时，将等待上传中的队列也清空
		clearAwaitUploadFileQueue()
	}

	// 全部开始
	function allStart() {
		// 筛选出状态为 init、pause 的文件
		const statusList = [FileStatus.INIT, FileStatus.PAUSE]
		const fileQueueList = fileQueue.filter(row => statusList.includes(row.status))

		// 将其都设置为 uploading 状态
		fileQueueList.forEach(row => {
			setFileStatus(row, FileStatus.UPLOADING)
		})
	}

	return {
		allStart,
		allClearQueue,
		allPause
	}
}
