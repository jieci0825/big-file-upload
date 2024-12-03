import { checkFileSize } from '@/utils'
import { FileStatus } from '../constants'
import { useBigFileUpload } from './useBigFileUpload'
import { useOtherFIleModeUpload } from './useOtherFileModeUpload'
import { useHandleFileQueue } from './useHandleFileQueue'
import {
	isMaxUploadCount,
	awaitUploadFileQueue,
	removeAwaitUploadFileQueue,
	addAwaitUploadFileQueue,
	bigFileStandardSize
} from './useInit'

const { processBigFileUpload } = useBigFileUpload()
const { uploadFileMap } = useOtherFIleModeUpload()
const { changeFileStatus, removeFile } = useHandleFileQueue()

export function useProcessFileStatus() {
	/**
	 * 处理下一个文件上传
	 */
	function processNextFileUpload() {
		// 查看等待上传文件队列中是否还存在任务
		if (awaitUploadFileQueue.length) {
			const nextFile = awaitUploadFileQueue.shift()
			if (nextFile) {
				// 并将等待状态的文件状态改为为上传中
				// changeFileStatus(nextFile, FileStatus.UPLOADING)
				processFileStatusUploading(nextFile)
			}
		}
	}

	/**
	 * 文件状态处理-SUCCESS
	 */
	function processFileStatusSuccess(file) {
		// todo 额外接受一个参数，表示是否已经存在，如果已经存在，则直接让后端添加一条文件记录即可
		changeFileStatus(file, FileStatus.SUCCESS)
		processNextFileUpload()
	}

	/**
	 * 文件状态处理-UPLOADING
	 */
	function processFileStatusUploading(file) {
		// 如果当前 file 的状态已经下面的状态，则不处理
		//  - 已经成功上传的无需再处理
		//  - 已经关闭的无需再处理
		const noProgressStatus = [FileStatus.SUCCESS, FileStatus.CLOSE]
		if (noProgressStatus.includes(file.status)) return

		// 如果设置的状态为上传中，判断是否达到最大上传数量
		if (isMaxUploadCount.value) {
			// 如果达到了，则将当前 file 状态设置为等待中。并加入等待队列
			addAwaitUploadFileQueue(file)
			changeFileStatus(file, FileStatus.WAITING)
		}
		// 没有达到最大上传数量，则直接上传
		else {
			if (checkFileSize(file.raw, bigFileStandardSize)) {
				// 大文件状态内部专属处理
				processBigFileUpload(file)
			} else {
				// 否则根据不同的 fileMode 调用不同的上传方法
				//  - 非大文件则统一为 UPLOADING 状态
				changeFileStatus(file, FileStatus.UPLOADING)
				uploadFileMap[file.fileMode](file)
			}
		}
	}

	/**
	 * 文件状态处理-PAUSE
	 */
	function processFileStatusPause(file) {
		// 如果处于上传中，则将文件状态改为暂停
		if (file.status === FileStatus.UPLOADING) {
			changeFileStatus(file, FileStatus.PAUSE)
		}
		// 如果处于等待中，则将文件状态设置为初始值
		else if (file.status === FileStatus.WAITING) {
			changeFileStatus(file, FileStatus.INIT)
			// 从等待队列中移除
			removeAwaitUploadFileQueue(file)
		}

		processNextFileUpload()
	}

	/**
	 * 文件状态处理-REMOVE
	 */
	function processFileStatusRemove(file) {
		// 先对文件上传进行暂停
		processFileStatusPause(file)
		// 然后将文件移出队列
		removeFile(file)
	}

	/**
	 * 文件状态处理-CANCEL
	 */
	function processFileStatusCancel(file) {
		// 只有非大文件才存在控制器进行取消操作
		if (!file.isBigFile) {
			file.controller.abort()
			changeFileStatus(file, FileStatus.CANCEL)
		}
	}

	/**
	 * 文件状态处理-other
	 */
	function processFileStatusOther(file, status) {
		changeFileStatus(file, status)
	}

	return {
		processFileStatusSuccess,
		processFileStatusUploading,
		processFileStatusPause,
		processFileStatusRemove,
		processFileStatusCancel,
		processFileStatusOther
	}
}
