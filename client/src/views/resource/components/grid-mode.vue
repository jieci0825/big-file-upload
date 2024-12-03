<script setup>
import { convertFileSize } from '@/utils'
import { resourceList } from '../hooks/useInit'
import { useShowItem } from '../hooks/useShowItem'
import '../styles/grid-mode.less'

const { previewResource, getFileTypeIcon, downloadResource } = useShowItem()
</script>

<template>
	<div class="grid-mode-wrap">
		<div
			v-for="item in resourceList"
			:key="item.id"
			class="grid-item-wrap"
		>
			<el-popover
				:show-after="1000"
				placement="bottom-end"
				popper-class="grid-item-wrap-popover"
				trigger="hover"
			>
				<template #reference>
					<div class="grid-item">
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
						<!-- 文件icon -->
						<div class="thumbnail">
							<span :class="['iconfont', getFileTypeIcon(item.ext)]"></span>
						</div>
						<!-- 文件名 -->
						<div class="filename">{{ item.filename }}</div>
					</div>
				</template>
				<div>
					<span>项目类型：{{ item.ext }}</span>
					<span>项目大小：{{ convertFileSize(item.size) }}</span>
					<span>项目名称：{{ item.filename }}</span>
				</div>
			</el-popover>
		</div>
	</div>
</template>

<style scoped lang="less">
.grid-mode-wrap {
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	gap: 12px;
	.grid-item-wrap {
		width: 170px;
		height: 170px;
		padding: 0px 15px;
		border-radius: var(--border-radius-small);
		transition: border 0.3s;
		background-color: var(--el-color-primary-light-9);
		border: 1px solid var(--el-color-primary-light-9);
		&:hover {
			border-color: var(--el-color-primary);
		}
		.grid-item {
			width: 100%;
			height: 100%;
			border-radius: 5px;
			cursor: pointer;
			overflow: hidden;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			.act {
				width: 100%;
				color: var(--el-color-primary);
				display: flex;
				justify-content: flex-end;
				gap: 5px;
				margin-bottom: 10px;
			}
			.thumbnail {
				.iconfont {
					font-size: 80px;
					color: var(--text-color-placeholder);
				}
			}
			.filename {
				margin-top: 15px;
				color: var(--text-color-regular);
				width: 100%;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}
}
</style>
