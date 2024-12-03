<script setup>
import { errorCount, successCount, totalCount } from '../hooks/useInit'
</script>

<template>
	<div class="upload-footer">
		<div class="item">
			<span>文件总数：</span>
			<span>{{ totalCount }}</span>
		</div>
		<div class="item">
			<span>上传成功：</span>
			<span>{{ successCount }}</span>
		</div>
		<div class="item">
			<span>上传失败：</span>
			<span>{{ errorCount }}</span>
		</div>
	</div>
</template>

<style scoped lang="less">
.upload-footer {
	flex-shrink: 0;
	margin-top: 20px;
	height: 50px;
	background-color: var(--el-color-info-light-9);
	display: flex;
	align-items: center;
	border-radius: var(--border-radius-small);
	padding: 0 10px;
	.item {
		font-size: 14px;
		font-weight: bold;
		color: var(--text-color-regular);
		margin-right: 20px;
	}
}
</style>
