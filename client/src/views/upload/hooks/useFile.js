import { computed, nextTick, reactive, ref } from 'vue'
import { FileStatus } from '../constants'
import { formatFile } from '@/utils'
import { useProcessFileStatus } from './useProcessFileStatus'
import { fileInputRef, fileQueue } from './useInit'

const {
	processFileStatusSuccess,
	processFileStatusUploading,
	processFileStatusPause,
	processFileStatusRemove,
	processFileStatusCancel,
	processFileStatusOther
} = useProcessFileStatus()

const _isMultiple = ref(false)

// 文件选择完成后需要执行的回调
let onFileChangeInterceptor = null

export function useFile() {
	/**
	 * 点击
	 */
	function handleClick() {
		nextTick(() => {
			fileInputRef.value.click()
		})
	}

	// 是否多选
	const isMultiple = computed(() => _isMultiple.value)

	/**
	 * 单选
	 */
	const enableSingle = interceptor => {
		_isMultiple.value = false
		onFileChangeInterceptor = interceptor
		handleClick()
	}

	/**
	 * 多选
	 */
	const enableMultiple = interceptor => {
		_isMultiple.value = true
		onFileChangeInterceptor = interceptor
		handleClick()
	}

	/**
	 * 监听文件
	 */
	const onFileChange = e => {
		const files = Array.from(e.target.files).map(formatFile)

		// 执行前置拦截器
		for (const file of files) {
			const flag = onFileChangeInterceptor.beforInterceptor(file)
			// 如果前置拦截器返回false，则不继续后续操作
			if (!flag) return
		}

		// 加入队列
		fileQueue.push(...files)

		const data = isMultiple.value ? fileQueue : fileQueue[fileQueue.length - 1]

		// 执行后置拦截器
		onFileChangeInterceptor.afterInterceptor && onFileChangeInterceptor.afterInterceptor(data)

		onFileChangeInterceptor = null
	}

	/**
	 * 设置文件状态
	 */
	const setFileStatus = (file, status) => {
		switch (status) {
			case FileStatus.UPLOADING:
				processFileStatusUploading(file)
				break
			case FileStatus.SUCCESS:
				processFileStatusSuccess(file)
				break
			case FileStatus.PAUSE:
				processFileStatusPause(file)
				break
			case FileStatus.REMOVE:
				processFileStatusRemove(file)
				break
			case FileStatus.CANCEL:
				processFileStatusCancel(file)
			default:
				processFileStatusOther(file, status)
				break
		}
	}

	return {
		onFileChange,
		isMultiple,
		enableSingle,
		enableMultiple,
		setFileStatus
	}
}
