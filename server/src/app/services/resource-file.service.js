const { formatTime } = require('@/utils')
const { FileRecord } = require('@models/fileRecord.model')
const { Op } = require('sequelize')

class Service {
	/**
	 * 获取资源列表
	 */
	async getResourceList(data) {
		const where = {}

		if (data.filename) {
			where.filename = { [Op.substring]: data.filename }
		}

		const { count, rows } = await FileRecord.findAndCountAll({
			where,
			order: [['id', 'DESC']],
			offset: (data.page - 1) * data.pageSize,
			limit: data.pageSize,
			attributes: {
				exclude: ['file_path', 'is_complete']
			}
		})

		rows.forEach(row => {
			row.dataValues.date = formatTime(row.dataValues.createdAt)
		})

		return { total: count, list: rows }
	}
}

module.exports = new Service()
