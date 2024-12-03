<script setup>
import Select from './components/select.vue'
import Act from './components/act.vue'
import Content from './components/content.vue'
import Footer from './components/footer.vue'
import { useFile } from './hooks/useFile'
import { fileInputRef } from './hooks/useInit'

const { onFileChange, isMultiple } = useFile()
</script>

<template>
	<div class="upload-container">
		<Select></Select>
		<Act></Act>
		<Content></Content>
		<Footer></Footer>
		<input
			@change="onFileChange"
			:multiple="isMultiple"
			ref="fileInputRef"
			type="file"
			style="display: none"
		/>
	</div>
</template>

<style scoped lang="less">
.upload-container {
	margin: 0 auto;
	height: 100%;
	max-width: var(--center-width);
	padding: 20px;
	display: flex;
	flex-direction: column;
}
</style>
