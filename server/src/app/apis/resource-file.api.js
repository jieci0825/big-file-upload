const Router = require('koa-router')
const router = new Router({ prefix: '/resource' })

const { accessResource, getResourceList, downloadResource } = require('@controllers/resource-file.controller')

// 访问资源
router.get('/access/:hash', accessResource)

// 返回文件列表
router.post('/list', getResourceList)

// 下载资源
router.get('/download/:hash', downloadResource)

module.exports = router
