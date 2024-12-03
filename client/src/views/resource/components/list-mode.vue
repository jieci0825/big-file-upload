<script setup>
import { convertFileSize } from '@/utils'
import { resourceList } from '../hooks/useInit'
import { useShowItem } from '../hooks/useShowItem'

const { previewResource, getFileTypeIcon, downloadResource } = useShowItem()
</script>

<template>
	<div class="list-mode-wrap">
		<div
			v-for="item in resourceList"
			:key="item.id"
			class="list-item"
		>
			<!-- 文件类型缩略图 -->
			<div class="thumbnail">
				<span :class="['iconfont', getFileTypeIcon(item.ext)]"></span>
			</div>
			<!-- 文件名称 -->
			<div class="filename">
				<el-tooltip
					effect="dark"
					:content="item.filename"
					placement="top"
				>
					{{ item.filename }}
				</el-tooltip>
			</div>
			<!-- 上传日期 -->
			<div class="date">{{ item.date }}</div>
			<!-- 文件大小 -->
			<div class="size">{{ convertFileSize(item.size) }}</div>
			<!-- act -->
			<div class="act">
				<el-link
					@click="previewResource(item)"
					type="primary"
					>预览</el-link
				>
				<el-link
					@click="downloadResource(item)"
					type="primary"
					>下载</el-link
				>
			</div>
		</div>
	</div>
</template>

<style scoped lang="less">
.list-mode-wrap {
	width: 100%;
	.list-item {
		width: 100%;
		height: 50px;
		margin-top: 10px;
		border-radius: var(--border-radius-small);
		display: flex;
		align-items: center;
		gap: 10px;
		color: var(--text-color-placeholder);
		padding: 0 10px 0 5px;
		transition: background 0.3s;
		&:hover {
			background-color: var(--el-color-primary-light-9);
		}
		.thumbnail {
			.iconfont {
				font-size: 30px;
				color: var(--text-color-placeholder);
			}
		}
		.filename {
			color: var(--text-color-regular);
			width: 40%;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.size {
			width: 100px;
		}
		.act {
			margin-left: auto;
			display: flex;
			gap: 10px;
		}
	}
}
</style>
