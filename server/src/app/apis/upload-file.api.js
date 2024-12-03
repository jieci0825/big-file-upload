const Router = require('koa-router')
const router = new Router({ prefix: '/upload' })

const {
	uploadSingleFileBase64,
	uploadSingleFileFormData,
	uploadBigFile,
	uploadMergeFile,
	checkFileComplete
} = require('@/app/controllers/upload-file.controller')

// 上传单文件-base64
router.post('/single/base64', uploadSingleFileBase64)

// 上传单文件-formData
router.post('/single/form-data', uploadSingleFileFormData)

// 检查当前文件是否上传完成
router.post('/check', checkFileComplete)

// 上传大文件
router.post('/big-chunk', uploadBigFile)

// 合并文件
router.post('/merge', uploadMergeFile)

module.exports = router
