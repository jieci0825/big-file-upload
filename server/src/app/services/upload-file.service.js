const { isArray } = require('@/utils')
const { FileRecord } = require('@models/fileRecord.model')

class Service {
	/**
	 * 根据文件hash获取文件记录
	 */
	async getFileRecordByHash(hash) {
		const result = await FileRecord.findOne({ where: { hash } })
		return result
	}

	/**
	 * 文件是否上传完成
	 */
	async isFileComplete(hash) {
		const fileRecord = await this.getFileRecordByHash(hash)
		if (!fileRecord) {
			return false
		}

		return !!fileRecord.is_complete
	}

	/**
	 * 修改文件记录
	 */
	async updateFileRecord(hash, data) {
		await FileRecord.update(data, { where: { hash } })
	}

	/**
	 * 创建文件记录
	 */
	async createFileRecord(data) {
		const fileRecord = await this.getFileRecordByHash(data.fileId)
		if (fileRecord) {
			return
		}

		let filePath = '--'
		if (data.filePath && isArray(data.filePath)) {
			filePath = JSON.stringify(data.filePath)
		}

		const inertData = {
			filename: data.filename,
			file_path: filePath,
			ext: data.filename.split('.').pop(),
			size: data.fileSize,
			hash: data.fileId,
			is_complete: data.isComplete
		}

		await FileRecord.create(inertData)
	}
}

module.exports = new Service()
