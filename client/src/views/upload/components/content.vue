<script setup>
import { convertFileSize } from '@/utils'
import { FileStatus, FileStatusTagType, FileStatusTextMap } from '../constants'
import { useFile } from '../hooks/useFile'
import { Delete, Upload, VideoPause } from '@element-plus/icons-vue'
import { fileQueue } from '../hooks/useInit'

const { setFileStatus } = useFile()

// 是否可以开始上传
function isDisabledStart(row) {
	const status = [FileStatus.INIT, FileStatus.PAUSE, FileStatus.FAIL, FileStatus.CANCEL]
	const result = status.includes(row.status)
	return !result
}

function showStartText(row) {
	const text = row.status === FileStatus.PAUSE ? '继续' : '开始'
	return text
}
</script>

<template>
	<div class="upload-content">
		<el-table
			:data="fileQueue"
			border
			style="width: 100%; height: 100%; border-radius: var(--border-radius-small)"
		>
			<el-table-column
				prop="name"
				label="文件名称"
				align="center"
				show-overflow-tooltip
				min-width="240"
			></el-table-column>
			<el-table-column
				prop="size"
				label="文件大小"
				align="center"
				width="120"
			>
				<template #default="{ row }">
					{{ convertFileSize(row.size) }}
				</template>
			</el-table-column>
			<el-table-column
				prop="type"
				label="文件类型"
				align="center"
				width="100"
			></el-table-column>
			<el-table-column
				prop="status"
				label="文件状态"
				align="center"
				width="100"
			>
				<template #default="{ row }">
					<el-tag :type="FileStatusTagType[row.status]">{{ FileStatusTextMap[row.status] }}</el-tag>
				</template>
			</el-table-column>
			<el-table-column
				prop="progress"
				label="上传进度"
				width="160"
				align="center"
			>
				<template #default="{ row }">
					<!-- 
						striped
						striped-flow
					-->
					<el-progress
						:duration="10"
						:stroke-width="18"
						:percentage="row.progress"
						text-inside
					/>
				</template>
			</el-table-column>
			<el-table-column
				prop="operate"
				label="操作"
				width="240"
				align="center"
			>
				<template #default="{ row }">
					<el-button
						@click="setFileStatus(row, FileStatus.UPLOADING)"
						:disabled="isDisabledStart(row)"
						:icon="Upload"
						type="primary"
						size="small"
						plain
					>
						{{ showStartText(row) }}
					</el-button>
					<el-button
						v-if="row.isBigFile"
						@click="setFileStatus(row, FileStatus.PAUSE)"
						:disabled="!(row.status === FileStatus.UPLOADING)"
						:icon="VideoPause"
						type="warning"
						size="small"
						plain
						>暂停</el-button
					>
					<el-button
						v-else
						@click="setFileStatus(row, FileStatus.CANCEL)"
						:disabled="!(row.status === FileStatus.UPLOADING)"
						:icon="VideoPause"
						type="danger"
						size="small"
						plain
						>取消</el-button
					>
					<el-button
						@click="setFileStatus(row, FileStatus.REMOVE)"
						:icon="Delete"
						type="danger"
						size="small"
						plain
						>移除</el-button
					>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<style scoped lang="less">
.upload-content {
	flex: 1;
	overflow: hidden auto;
}
</style>
