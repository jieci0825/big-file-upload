import { ref } from 'vue'

export const resourceList = ref([])
export const resourceTotal = ref(0)

export function updateResourceInfo({ list, total }) {
	resourceList.value = list
	resourceTotal.value = total
}
