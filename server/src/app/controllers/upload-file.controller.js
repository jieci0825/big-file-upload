const path = require('path')
const fs = require('fs')
const { DataSuccess, Success, NotFound } = require('@/core/error-type')
const service = require('@/app/services/upload-file.service')
const { getChunksPathArray, checkMergeFile, genStorageFilePath, delay } = require('@/utils')

async function processMerge({ mergeFilePath, targetPath, mergeChunkPathList, fileRecord, count = 0 }) {
	console.log(`第【${count}】次合并`)
	if (count >= 5) {
		return console.log(`合并文件失败`, fileRecord.hash)
	}
	// 创建写入流
	const writeStream = fs.createWriteStream(mergeFilePath)
	for (const chunkPath of mergeChunkPathList) {
		if (!fs.existsSync(chunkPath)) {
			console.log(`分块文件【${chunkPath}】不存在，跳过`)
			continue
		}
		// 读取分块文件
		const data = fs.readFileSync(chunkPath)
		// 写入分块文件
		writeStream.write(data)
	}

	// 监听写入完成事件
	writeStream.on('finish', async () => {
		try {
			// 校验哈希
			await checkMergeFile(mergeFilePath, fileRecord.hash)
			// 校验成功后，删除分块文件
			fs.rmSync(targetPath, { recursive: true, force: true })
		} catch (error) {
			console.log(`合并文件失败，错误信息：${error.message}`)
			// 失败则重新合并
			processMerge({ mergeFilePath, targetPath, mergeChunkPathList, fileRecord, count: count + 1 })
		}
	})

	// 关闭写入流
	writeStream.end()
}

class Contriller {
	/**
	 * 上传单文件-base64
	 */
	async uploadSingleFileBase64(ctx) {
		const { filename, fileId, file, fileSize } = ctx.request.body

		const isComplete = await service.isFileComplete(fileId)
		if (isComplete) {
			throw new Success('上传成功')
		}

		// 提取 Base64 数据
		const base64Data = file.replace(/^data:image\/\w+;base64,/, '')
		const buffer = Buffer.from(base64Data, 'base64')

		const ext = filename.split('.').pop()

		// 将 Base64 数据写入文件
		const newFilename = `${fileId}.${ext}`
		const filePath = genStorageFilePath(newFilename)
		fs.writeFileSync(filePath, buffer)

		// 记录文件信息
		await service.createFileRecord({
			filename,
			filePath: [newFilename],
			fileSize,
			fileId,
			isComplete: true
		})

		throw new Success('上传成功')
	}

	/**
	 * 上传单文件-formData
	 */
	async uploadSingleFileFormData(ctx) {
		const { files, body } = ctx.request
		const { filename, fileId, fileSize } = body

		// 临时文件存储路径
		const tempFilePath = files.file.filepath

		const isComplete = await service.isFileComplete(fileId)
		// 已经存在则删除临时文件
		if (isComplete) {
			fs.unlinkSync(tempFilePath)
			throw new Success('上传成功')
		}

		// 将临时文件移动到指定文件夹
		const ext = filename.split('.').pop()
		const newFilename = `${fileId}.${ext}`
		const filePath = genStorageFilePath(newFilename)

		try {
			fs.renameSync(tempFilePath, filePath)
		} catch (error) {
			console.log('移动失败: ', filename)
		}

		// 记录文件信息
		await service.createFileRecord({
			filename,
			filePath: [newFilename],
			fileSize,
			fileId,
			isComplete: true
		})

		throw new Success('上传成功')
	}

	/**
	 * 上传大文件
	 */
	async uploadBigFile(ctx) {
		const { files, body } = ctx.request

		// 临时文件存储路径
		const tempFilePath = files.chunkBlob.filepath

		const fileRecord = await service.getFileRecordByHash(body.fileId)
		// 如果文件记录存在且文件已经上传完成，则表示此文件已经上传过了，无需上传
		if (fileRecord && fileRecord.is_complete) {
			// 删除临时文件
			fs.unlinkSync(tempFilePath)
			throw new Success('上传成功')
		}

		// 根据当前完整的文件id创建文件夹
		const rootPath = process.cwd()
		const dirPath = path.resolve(rootPath, 'uploads', body.fileId)
		// 根据路径创建检测文件夹是否存在，不存在则创建
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath)
			await service.createFileRecord({
				isComplete: false,
				...body
			})
		}

		// 将临时文件移动到指定文件夹，采用 chunkIndex_chunkHash 的命名方式
		const filePath = path.resolve(dirPath, `${body.chunkIndex}_${body.chunkHash}`)

		try {
			fs.renameSync(tempFilePath, filePath)
		} catch (error) {
			console.log('移动失败：', `${body.chunkIndex}_${body.chunkHash}`)
		}
		throw new Success('上传成功')
	}

	/**
	 * 合并文件
	 */
	async uploadMergeFile(ctx) {
		const data = ctx.request.body
		const { fileId } = data

		const fileRecord = await service.getFileRecordByHash(fileId)
		if (!fileRecord) {
			throw new NotFound('文件不存在')
		}

		// 找到目标文件夹
		const rootPath = process.cwd()
		const targetPath = path.resolve(rootPath, 'uploads', fileId)

		const mergeChunkPathList = getChunksPathArray(targetPath, { mode: 'path' })

		// 合并文件存储路径，将其存入 assets 文件夹下
		const newFilename = `${fileId}.${fileRecord.ext}`
		const mergeFilePath = path.resolve(rootPath, 'assets', newFilename)

		processMerge({ mergeFilePath, targetPath, mergeChunkPathList, fileRecord, count: 0 })

		const updateData = {
			is_complete: true,
			file_path: JSON.stringify([newFilename])
		}
		await service.updateFileRecord(fileId, updateData)

		throw new Success('合并成功')
	}

	/**
	 * 检查文件是否上传完成
	 */
	async checkFileComplete(ctx) {
		const { fileId } = ctx.request.body
		const fileRecord = await service.getFileRecordByHash(fileId)

		if (!fileRecord) {
			// 不存在，则表示没有上传过，返回空数组
			throw new DataSuccess([])
		}

		if (fileRecord.is_complete) {
			// 完成成返回 true
			throw new DataSuccess(true)
		}

		const rootPath = process.cwd()
		const dirPath = path.resolve(rootPath, 'uploads', fileId)
		// 检测这个目录是否存在
		if (!fs.existsSync(dirPath)) {
			// 如果不存在，则表示没有上传过，返回空数组
			throw new DataSuccess([])
		}

		const mergeChunkHashList = getChunksPathArray(dirPath, { mode: 'hash' })

		// 如果没上传过，则返回空数组
		throw new DataSuccess(mergeChunkHashList)
	}
}

module.exports = new Contriller()
