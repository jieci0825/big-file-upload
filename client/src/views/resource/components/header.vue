<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToUpload = () => {
	router.push('/upload')
}
</script>

<template>
	<div class="resource-header">
		<div class="title">文件列表</div>
		<div class="btns">
			<el-button
				@click="goToUpload"
				type="primary"
				>继续上传</el-button
			>
		</div>
	</div>
</template>

<style scoped lang="less">
.resource-header {
	width: 100%;
	padding-bottom: 10px;
	margin-bottom: 20px;
	border-bottom: 1px solid var(--border-color);
	display: flex;
	.title {
		font-size: 22px;
		color: var(--text-color-primary);
		font-weight: bold;
	}
	.btns {
		margin-left: auto;
		display: flex;
		align-items: center;
	}
}
</style>
