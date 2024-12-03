<script setup></script>

<template>
	<div class="upload-select">
		<el-icon :size="50">
			<MostlyCloudy />
		</el-icon>
		<p>
			将文件拖到此处(拖拽待开发)，或
			<el-text
				style="cursor: pointer"
				type="primary"
				>点击上传</el-text
			>
		</p>
		<p>文件大于 50m，则开启大文件上传，大文件统一为FROM-DATA格式上传</p>
	</div>
</template>

<style scoped lang="less">
.upload-select {
	flex-shrink: 0;
	width: 100%;
	height: 180px;
	border: 2px dashed var(--border-color);
	border-radius: var(--border-radius);
	transition: border 0.2s ease-in;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	color: var(--text-color-disabled);
	&:hover {
		border-color: var(--primary-color);
	}
	:deep(.el-icon) {
		color: var(--text-color-placeholder);
	}
	p {
		margin-bottom: 5px;
		&:last-child {
			margin-bottom: 0;
		}
	}
}
</style>
