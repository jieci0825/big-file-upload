const dayjs = require('dayjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const SparkMD5 = require('spark-md5')

const isArray = Array.isArray

/**
 * md5加密方法
 * @param {string} password 传入需要加密的密码
 */
function md5password(password) {
	const md5 = crypto.createHash('md5')
	return md5.update(password).digest('hex')
}

/**
 * 生成随机字符串长度
 * @param {Number} 长度 默认值：6
 * @returns {string}
 */
const generateRandomString = (len = 6) => {
	if (len <= 11) {
		return Math.random()
			.toString(36)
			.substring(2, 2 + len)
			.padEnd(len, '0')
	} else {
		return generateRandomString(11) + generateRandomString(len - 11)
	}
}

/**
 * 生成一个随机整数
 * @param {Number} min 最小值
 * @param {Number} max 最大值
 * @returns {Number}
 */
const generateRandomInteger = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 格式化时间
 * @param {Date|string} time 需要格式化的时间
 * @param {string} str 格式化字符串 `YYYY-MM-DD HH:mm:ss`
 * @returns {string}
 */
const formatTime = (time = new Date(), str = 'YYYY-MM-DD HH:mm:ss') => {
	return dayjs(time).format(str)
}

/**
 * 检测一个值是否属存在于当前枚举对象
 * @param {*} value 检测的值
 * @returns {Boolean}
 */
function isThisType(value) {
	for (const key in this) {
		if (this[key] === value) {
			return true
		}
	}
	return false
}

/**
 * 创建一个枚举对象
 * @param {object} enums
 * @returns {object} 返回一个模拟的枚举对象
 */
function createEnums(enums) {
	// 让 isThisType 属性不可遍历
	Object.defineProperty(enums, 'isThisType', {
		value: isThisType,
		enumerable: false
	})
	return Object.freeze(enums)
}

/**
 * 生成 token
 * @param {*} info 保存的信息
 * @param {string} secretKey 密钥
 * @param {*} expiresIn 有效时间
 * @returns {string}
 */
function generateToken(info, secretKey, expiresIn) {
	const token = jwt.sign(info, secretKey, { expiresIn })
	return token
}

/**
 * 校验合并后文件合法性
 */
function checkMergeFile(mergeFilePath, diffHash) {
	return new Promise(async (resolve, reject) => {
		const mergeFileHash = await calcFileHashId(mergeFilePath)

		if (mergeFileHash === diffHash) {
			resolve(true)
		} else {
			// 进行合并重试
			reject('文件合并失败')
		}
	})
}

/**
 * 计算文件哈希id
 */
function calcFileHashId(filePath, bytesToRead = 30 * 1024 * 1024) {
	return new Promise((resolve, reject) => {
		fs.stat(filePath, (err, stats) => {
			if (err) {
				reject(err)
				return
			}

			const size = Math.min(bytesToRead, stats.size)
			const readStream = fs.createReadStream(filePath, { start: 0, end: size - 1 })
			const spark = new SparkMD5.ArrayBuffer()

			readStream.on('data', chunk => {
				// 将每个块添加到 SparkMD5 实例中
				spark.append(chunk)
			})

			readStream.on('end', () => {
				// 计算最终的 MD5 哈希
				const hash = spark.end()
				resolve(hash)
			})

			readStream.on('error', err => {
				reject(err)
			})
		})
	})
}

/**
 * 获取目标文件夹下的分块文件进行排序且返回路径数组
 */
function getChunksPathArray(targetDir, options) {
	options = Object.assign(
		{
			mode: 'path' // path 表示返回路径，hash 表示返回哈希值
		},
		options
	)

	// 获取目标文件夹下所有文件
	const files = fs.readdirSync(targetDir) || []
	// 对文件进行排序
	const mergeChunkPathList = []
	files.forEach(fileName => {
		const [chunkIndex, chunkHash] = fileName.split('_')
		if (options.mode === 'path') {
			// 合并文件路径
			const chunkPath = path.resolve(targetDir, fileName)
			mergeChunkPathList[chunkIndex] = chunkPath
		} else if (options.mode === 'hash') {
			// 合并文件哈希值
			mergeChunkPathList.push(chunkHash)
		}
	})

	return mergeChunkPathList
}

/**
 * 生成存储文件路径
 */
function genStorageFilePath(filename) {
	return path.resolve(process.cwd(), 'assets', filename)
}

/**
 * 转为驼峰命名法
 * @param {string} key
 */
function toCamelCase(key) {
	const splits = key.split('_')
	if (splits.length === 1) {
		return key
	}
	return splits
		.map((word, index) =>
			index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
		)
		.join('')
}

/**
 * 给一个对象里面的所有属性名转为驼峰命名法
 * @param {object} obj
 */
function toCamelCaseForObj(obj) {
	for (const key in obj) {
		const oldKey = key
		const newKey = toCamelCase(key)
		if (oldKey !== newKey) {
			obj[toCamelCase(key)] = obj[key]
			delete obj[key]
		}
	}
	return obj
}

/**
 * 补全资源路径
 */
function completeResourcePath(resourcePath) {
	const filePaths = JSON.parse(resourcePath)
	const filePath = path.resolve(process.cwd(), 'assets', ...filePaths)
	return filePath
}

function delay(ms) {
	return new Promise(resolve => {
		setTimeout(resolve, ms)
	})
}

module.exports = {
	isArray,
	formatTime,
	generateRandomString,
	generateRandomInteger,
	md5password,
	createEnums,
	generateToken,
	calcFileHashId,
	getChunksPathArray,
	checkMergeFile,
	genStorageFilePath,
	toCamelCase,
	toCamelCaseForObj,
	completeResourcePath,
	delay
}
