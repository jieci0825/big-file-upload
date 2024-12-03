const path = require('path')
const serve = require('koa-static')
const cors = require('@koa/cors')
const { koaBody } = require('koa-body')
const InitModule = require('@/core/init')
const { handleError } = require('@/core/handle-error')

/**
 * 跨域支持
 * @param app koa实例
 */
function applyCors(app) {
	app.use(cors())
}

/**
 * 解析Body参数储
 * @param app koa实例
 */
function applyBodyParse(app) {
	const uploadsTempPath = path.join(process.cwd(), 'uploadsTemp')
	app.use(
		koaBody({
			multipart: true, // 启用 multipart 处理
			formidable: {
				uploadDir: uploadsTempPath, // 上传文件的存路径
				keepExtensions: true // 保持文件扩展名
			},
			formLimit: '5mb'
		})
	)
}

/**
 * 静态文件支持
 * @param app koa实例
 */
function applyStatic(app) {
	app.use(serve(path.resolve(process.cwd(), 'public'), { maxage: 1000 * 60 * 60 }))
}

function registerApp(app) {
	applyCors(app)
	applyBodyParse(app)
	applyStatic(app)
	app.use(handleError)
	InitModule.initMain(app)
}

module.exports = { registerApp }
