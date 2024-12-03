import { calcFileHashId, isBoolean } from '@/utils'
import { FileStatus, UploadFileType } from '../constants'
import { reqCheckFile, reqUploadSingleBase64, reqUploadSingleFormData } from '@/apis'
import { useFile } from './useFile'

const { setFileStatus } = useFile()

export function useOtherFIleModeUpload() {
	/**
	 * 处理上传进度
	 */
	function processUploadProgress(fileData) {
		const onUploadProgress = progressEvent => {
			if (progressEvent.lengthComputable) {
				const percent = Math.floor((progressEvent.loaded / progressEvent.total) * 100)
				fileData.progress = percent
			}
		}
		return onUploadProgress
	}

	/**
	 * 处理FormData上传
	 */
	async function processFormDataUpload(data) {
		const fileRaw = data.raw

		const hash = await calcFileHashId(fileRaw)

		const resp = await reqCheckFile({ fileId: hash })
		if (isBoolean(resp.data) && resp.data) {
			data.progress = 100
			setFileStatus(data, FileStatus.SUCCESS)
			return
		}

		const formData = new FormData()
		formData.append('file', fileRaw)
		formData.append('filename', fileRaw.name)
		formData.append('fileId', hash)
		formData.append('fileSize', fileRaw.size)

		const { request, controller } = reqUploadSingleFormData(formData, processUploadProgress(data))
		// 给data添加controller，用于后续取消上传
		data.controller = controller
		await request()
		setFileStatus(data, FileStatus.SUCCESS)
	}

	/**
	 * 处理base64上传
	 */
	async function processBase64Upload(data) {
		const fileRaw = data.raw

		const hash = await calcFileHashId(fileRaw)
		const resp = await reqCheckFile({ fileId: hash })
		if (isBoolean(resp.data) && resp.data) {
			data.progress = 100
			setFileStatus(data, FileStatus.SUCCESS)
			return
		}
		const base64 = await readAsBase64(fileRaw)

		const uploadData = {
			filename: fileRaw.name,
			fileId: hash,
			file: base64,
			fileSize: fileRaw.size
		}
		const { request, controller } = reqUploadSingleBase64(uploadData, processUploadProgress(data))
		data.controller = controller
		await request()
		setFileStatus(data, FileStatus.SUCCESS)
	}

	/**
	 * 将文件读取为base64
	 */
	function readAsBase64(file) {
		return new Promise((resolve, reject) => {
			const fileReader = new FileReader()
			fileReader.onload = function (e) {
				resolve(e.target.result)
			}
			fileReader.onerror = function (e) {
				reject('读取失败')
			}
			fileReader.readAsDataURL(file)
		})
	}

	// 上传文件格式方法映射
	const uploadFileMap = {
		[UploadFileType.FORM_DATA]: processFormDataUpload,
		[UploadFileType.BASE64]: processBase64Upload
	}

	return {
		uploadFileMap
	}
}
