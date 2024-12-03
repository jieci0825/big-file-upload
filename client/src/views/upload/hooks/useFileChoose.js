import { ElMessage } from 'element-plus'
import { UploadFileType } from '../constants'
import { useFile } from './useFile'
import { checkFileSize, convertFileSize, isImageFileType } from '@/utils'

const { enableSingle, enableMultiple } = useFile()

export function useFileChoose() {
	/**
	 * 单文件选取
	 */
	const singlefileChoose = mode => {
		// 单文件选择有不同的模式选择
		const interceptor = getModeInterceptor(mode)
		enableSingle(interceptor)
	}

	/**
	 * 多文件选取
	 */
	const multifileChoose = () => {
		// 多文件选择则默认为 formData 模式
		const interceptor = getModeInterceptor()
		enableMultiple(interceptor)
	}

	/**
	 * 获取当前上传模式对应的拦截器
	 */
	function getModeInterceptor(mode = UploadFileType.FORM_DATA) {
		// 不同文件类型上传之前需要做的拦截操作
		const interceptor = {
			beforInterceptor: fileData => {
				return true
			},
			afterInterceptor: undefined
		}
		switch (mode) {
			// form-data
			case UploadFileType.FORM_DATA:
				interceptor.afterInterceptor = fileData => {
					fileData.fileMode = UploadFileType.FORM_DATA
				}
				break
			// base64
			case UploadFileType.BASE64:
				interceptor.beforInterceptor = fileData => {
					const fileRaw = fileData.raw
					if (!isImageFileType(fileRaw.type)) {
						ElMessage.warning('base64 只能上传图片文件')
						return false
					}
					const maxSize = 2 * 1024 * 1024
					if (checkFileSize(fileRaw, maxSize)) {
						ElMessage.warning(`base64 只能上传小于 ${convertFileSize(maxSize)} 的图片文件`)
						return false
					}
					return true
				}
				interceptor.afterInterceptor = fileData => {
					fileData.fileMode = UploadFileType.BASE64
				}
				break
			// 其他
			default:
				interceptor.beforInterceptor = () => {
					ElMessage.warning('请选择正确的上传模式')
					return false
				}
				break
		}

		return interceptor
	}

	return {
		singlefileChoose,
		multifileChoose
	}
}
