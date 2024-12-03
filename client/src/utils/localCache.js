export function getCache(key) {
	if (!key) return

	let result

	try {
		result = JSON.parse(localStorage.getItem(key))
	} catch (error) {
		result = localStorage.getItem(key)
	}

	return result
}

export function setCache(key, value) {
	if (!key) return

	let result
	try {
		result = JSON.stringify(value)
	} catch (error) {
		result = value
	}

	localStorage.setItem(key, result)
}

export function removeCache(key) {
	if (!key) return

	localStorage.removeItem(key)
}
