<script setup>
import { useRouter } from 'vue-router'
import { UploadFileType } from '../constants'
import { useAction } from '../hooks/useAction'
import { useFileChoose } from '../hooks/useFileChoose'

const { allStart, allClearQueue, allPause } = useAction()
const { singlefileChoose, multifileChoose } = useFileChoose()

const router = useRouter()

const goToResource = () => {
	router.push('resource')
}
</script>

<template>
	<div class="upload-act">
		<div class="upload-act__left">
			<el-dropdown @command="singlefileChoose">
				<el-button
					type="primary"
					plain
					>单文件选取</el-button
				>
				<template #dropdown>
					<el-dropdown-menu>
						<el-dropdown-item :command="UploadFileType.BASE64">BASE64</el-dropdown-item>
						<el-dropdown-item :command="UploadFileType.FORM_DATA">FORM-DATA</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
			<el-button
				@click="multifileChoose"
				type="primary"
				plain
				>多文件选取</el-button
			>
		</div>
		<div class="upload-act__right">
			<el-button
				@click="allClearQueue"
				type="danger"
				>清空队列</el-button
			>
			<el-button
				@click="allPause"
				type="warning"
				>全部暂停</el-button
			>
			<el-button
				@click="allStart"
				type="success"
				>全部开始</el-button
			>
			<el-button
				@click="goToResource"
				type="primary"
				>查看上传文件</el-button
			>
		</div>
	</div>
</template>

<style scoped lang="less">
.upload-act {
	flex-shrink: 0;
	display: flex;
	align-items: center;
	margin: 15px 0;
	.upload-act__left {
		flex: 1;
		display: flex;
		gap: 10px;
	}
	.upload-act__right {
		margin-left: auto;
	}
}
</style>
