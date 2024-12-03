export const UploadKey = Symbol('upload')

export const UploadFileType = {
	FORM_DATA: 'form_data',
	BASE64: 'base64'
}

export const FileStatus = {
	INIT: 'init',
	WAITING: 'waiting',
	PAUSE: 'pause',
	LOADING: 'loading', // 此状态用于表示处理文件分块时的状态
	UPLOADING: 'uploading',
	SUCCESS: 'success',
	FAIL: 'fail',
	CANCEL: 'cancel', // 非大文件
	REMOVE: 'remove'
}

export const FileStatusTextMap = {
	[FileStatus.INIT]: '待上传',
	[FileStatus.WAITING]: '等待中',
	[FileStatus.LOADING]: '加载中',
	[FileStatus.PAUSE]: '已暂停',
	[FileStatus.UPLOADING]: '上传中',
	[FileStatus.SUCCESS]: '成功',
	[FileStatus.FAIL]: '失败',
	[FileStatus.CANCEL]: '已取消',
	[FileStatus.REMOVE]: '移除'
}

export const FileStatusTagType = {
	[FileStatus.INIT]: 'info',
	[FileStatus.WAITING]: 'info',
	[FileStatus.LOADING]: 'info',
	[FileStatus.PAUSE]: 'warning',
	[FileStatus.UPLOADING]: 'primary',
	[FileStatus.SUCCESS]: 'success',
	[FileStatus.FAIL]: 'danger',
	[FileStatus.CANCEL]: 'danger',
	[FileStatus.REMOVE]: 'danger'
}
