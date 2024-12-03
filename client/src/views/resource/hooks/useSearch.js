import { reactive, ref } from 'vue'
import { updateResourceInfo } from './useInit'
import { reqResourceList } from '@/apis'

const pageInfo = reactive({
	currentPage: 1,
	pageSize: 20
})

const keyword = ref('')

export function useSearch() {
	/**
	 * 分页大小改变
	 */
	function handleSizeChange(val) {
		// 分页大小改变同时重置分页到第一页
		pageInfo.currentPage = 1
		pageInfo.pageSize = val
		handleSearch()
	}

	/**
	 * 当前页改变
	 */
	function handleCurrentChange(val) {
		pageInfo.currentPage = val
		handleSearch()
	}

	/**
	 * 开始搜素
	 */
	async function handleSearch() {
		const condition = {
			filename: keyword.value,
			page: pageInfo.currentPage,
			pageSize: pageInfo.pageSize
		}

		const resp = await reqResourceList(condition)
		updateResourceInfo(resp.data)
	}

	return {
		keyword,
		pageInfo,
		handleSizeChange,
		handleCurrentChange,
		handleSearch
	}
}
