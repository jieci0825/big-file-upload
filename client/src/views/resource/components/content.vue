<script setup>
import ListMode from './list-mode.vue'
import GridMode from './grid-mode.vue'
import { useSearch } from '../hooks/useSearch'
import { useControl } from '../hooks/useControl'
import { ShowMode, ShowModeTextMap } from '../constants'
import { computed, ref } from 'vue'

const { keyword, handleSearch } = useSearch()
const { currentShowMode, triggerShowMode, getOppositeShowMode } = useControl()

const curComp = computed(() => {
	return currentShowMode.value === ShowMode.LIST ? ListMode : GridMode
})
</script>

<template>
	<div class="resource-content">
		<div class="content-act">
			<div class="search-wrap">
				<form @submit.prevent="handleSearch">
					<el-input
						v-model="keyword"
						placeholder="输入文件名称搜索"
					></el-input>
					<button style="display: none"></button>
				</form>
				<el-button
					@click="handleSearch"
					style="margin-left: 10px"
					type="primary"
				>
					搜索</el-button
				>
			</div>
			<div class="control-wrap">
				<el-button
					@click="triggerShowMode"
					type="primary"
					>{{ ShowModeTextMap[getOppositeShowMode()] }}</el-button
				>
			</div>
		</div>
		<div class="content-show">
			<Component :is="curComp" />
		</div>
	</div>
</template>

<style scoped lang="less">
.resource-content {
	width: 100%;
	flex: 1;
	border: 1px solid var(--border-color);
	border-radius: var(--border-radius-small);
	padding: 15px;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	.content-act {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		padding-bottom: 10px;
		border-bottom: 1px solid var(--border-color);
		margin-bottom: 10px;
		.search-wrap {
			display: flex;
		}
		.control-wrap {
			margin-left: auto;
		}
	}
	.content-show {
		width: 100%;
		flex: 1;
		overflow: hidden auto;
	}
}
</style>
