import { ref } from 'vue'
import { ShowMode, ShowModeKey } from '../constants'
import { getCache, setCache } from '@/utils'

const currentShowMode = ref(getCache(ShowModeKey) || ShowMode.LIST)

export function useControl() {
	/**
	 * 获取相反的显示模式
	 */
	const getOppositeShowMode = () => {
		return currentShowMode.value === ShowMode.LIST ? ShowMode.GRID : ShowMode.LIST
	}

	/**
	 * 切换显示模式
	 */
	function triggerShowMode() {
		const newMode = getOppositeShowMode()
		currentShowMode.value = newMode
		setCache(ShowModeKey, newMode)
	}

	return {
		currentShowMode,
		triggerShowMode,
		getOppositeShowMode
	}
}
