const wait = (ms = 1000) => {
	return new Promise(resolve => {
		setTimeout(resolve, ms)
	})
}

const poll = async(fn, fnCondition, ms) => {
	let result = await fn()
	while (fnCondition(result)) {
		await wait(ms)
		result = await fn()
	}

	return result
}

export {
	poll,
	wait
}
