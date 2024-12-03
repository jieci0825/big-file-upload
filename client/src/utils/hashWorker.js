importScripts('./hash.js')

self.onmessage = async function (e) {
	// start 和 end 是当前线程分配到的文件块范围(即一个完整文件中的一部分)
	//  - 而文件块范围里面包含按照了 chunkSize 切割的文件块
	const { chunks, i, start, end } = e.data

	let startIndex = start
	let endIndex = end

	const tasks = []
	while (startIndex < endIndex) {
		const fileChunk = chunks.shift()
		tasks.push(computedChunkHash(fileChunk, startIndex))
		startIndex++
	}

	const threadHashList = await Promise.all(tasks)

	self.postMessage(threadHashList)
}
