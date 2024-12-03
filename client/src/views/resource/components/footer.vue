<script setup>
import { resourceTotal } from '../hooks/useInit'
import { useSearch } from '../hooks/useSearch'

const { pageInfo, handleSizeChange, handleCurrentChange } = useSearch()
</script>

<template>
	<div class="resource-footer">
		<el-pagination
			v-model:current-page="pageInfo.currentPage"
			v-model:page-size="pageInfo.pageSize"
			@size-change="handleSizeChange"
			@current-change="handleCurrentChange"
			:page-sizes="[10, 20, 30, 50]"
			:total="resourceTotal"
			layout="total, sizes, ->, prev, pager, next, jumper"
			background
		/>
	</div>
</template>

<style scoped lang="less">
.resource-footer {
	flex-shrink: 0;
	margin-top: 15px;
	width: 100%;
}
</style>
