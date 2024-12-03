const { DataTypes, Model } = require('sequelize')
const { sequelize } = require('@/core/db')

class FileRecord extends Model {}

FileRecord.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		filename: {
			type: DataTypes.STRING,
			allowNull: false,
			comment: '用户名'
		},
		ext: {
			type: DataTypes.STRING,
			allowNull: false,
			comment: '文件扩展名'
		},
		size: {
			type: DataTypes.INTEGER,
			allowNull: false,
			comment: '文件大小'
		},
		file_path: {
			type: DataTypes.TEXT,
			allowNull: false,
			comment: '文件路径'
		},
		hash: {
			type: DataTypes.STRING,
			allowNull: false,
			comment: '文件哈希'
		},
		is_complete: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
			comment: '此文件上传是否完成'
		}
	},
	{ sequelize, tableName: 'file_records' }
)

module.exports = { FileRecord }
