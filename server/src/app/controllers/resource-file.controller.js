const fs = require('fs')
const path = require('path')
const { NotFound, DataSuccess } = require('@/core/error-type')
const service = require('@services/resource-file.service')
const uploadFileService = require('@services/upload-file.service')
const { completeResourcePath } = require('@/utils')

const MimeTypes = {
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	gif: 'image/gif',
	pdf: 'application/pdf',
	mp3: 'audio/mpeg',
	mp4: 'video/mp4'
}

class Controller {
	/**
	 * 访问资源
	 */
	async accessResource(ctx) {
		const { hash } = ctx.params
		const fileRecord = await uploadFileService.getFileRecordByHash(hash)
		if (!fileRecord) {
			throw new NotFound('资源不存在')
		}

		const filePath = completeResourcePath(fileRecord.file_path)
		const type = MimeTypes[fileRecord.ext]
		ctx.set('Content-Type', type)
		ctx.body = fs.createReadStream(filePath)
	}

	/**
	 * 获取资源列表
	 */
	async getResourceList(ctx) {
		const data = ctx.request.body
		const result = await service.getResourceList(data)
		throw new DataSuccess(result)
	}

	/**
	 * 下载资源
	 */
	async downloadResource(ctx) {
		const { hash } = ctx.params
		const fileRecord = await uploadFileService.getFileRecordByHash(hash)
		if (!fileRecord) {
			throw new NotFound('资源不存在')
		}

		const filePath = completeResourcePath(fileRecord.file_path)
		const filename = `${fileRecord.filename}.${fileRecord.ext}`

		ctx.set('Content-Type', 'application/octet-stream')
		ctx.set('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}`)
		ctx.set('Content-Length', fileRecord.size)

		ctx.body = fs.createReadStream(filePath)
	}
}

module.exports = new Controller()
