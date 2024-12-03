importScripts('/node_modules/spark-md5/spark-md5.js')

function computedChunkHash(chunk, index) {
	return new Promise((resolve, reject) => {
		const spark = new SparkMD5.ArrayBuffer()
		const fileReader = new FileReader()
		fileReader.onload = function (e) {
			spark.append(e.target.result)
			const hash = spark.end()
			resolve({
				chunkHash: hash,
				chunkIndex: index,
				chunkBlob: chunk
			})
		}
		// 读取文件块
		fileReader.readAsArrayBuffer(chunk)
	})
}
