import { audios, BaseURL, images, videos } from '@/constants'
import { ElMessage } from 'element-plus'

export function useShowItem() {
	/**
	 * 预览资源
	 */
	function previewResource({ hash, ext }) {
		if (!hash) return
		if (images.includes(ext) || videos.includes(ext) || audios.includes(ext)) {
			window.open(`${BaseURL}/resource/access/${hash}`)
		} else {
			ElMessage.warning('该类型文件暂不支持预览，如有需要，请下载查看')
		}
	}

	/**
	 * 下载文件
	 */
	function downloadResource({ hash }) {
		if (!hash) return
		window.open(`${BaseURL}/resource/download/${hash}`)
	}

	/**
	 * 获取文件类型缩略图
	 */
	function getFileTypeIcon(ext) {
		if (images.includes(ext)) {
			return 'icon-image-file'
		} else if (videos.includes(ext)) {
			return 'icon-video-file'
		} else if (audios.includes(ext)) {
			return 'icon-music-file'
		} else {
			return 'icon-unknown-file'
		}
	}

	return {
		previewResource,
		downloadResource,
		getFileTypeIcon
	}
}
