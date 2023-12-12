import { fillVariablesIntoString } from '@/lib/utils'

describe('utils.fillVariablesIntoString', () => {
	it('fills variables into a string', () => {
		const variables = {
			"MY_VALUE": "123"
		}

		const str = "Hello [MY_VALUE]"
		const expected = "Hello 123"
		const actual = fillVariablesIntoString(str, variables)
		expect(actual).toEqual(expected)
	})

	it('replace the value with the variable name when variable does not exist', () => {
		const variables = {
			"MY_VALUE": "123"
		}

		const str = "Hello [SOMETHING]"
		const expected = "Hello [SOMETHING]"
		const actual = fillVariablesIntoString(str, variables)
		expect(actual).toEqual(expected)
	})

	it('replaces multiple variables', () => {
		const variables = {
			"MY_VALUE": "123",
			"MY_OTHER_VALUE": "456"
		}

		const str = "Hello [MY_VALUE] and [MY_OTHER_VALUE]"
		const expected = "Hello 123 and 456"
		const actual = fillVariablesIntoString(str, variables)
		expect(actual).toEqual(expected)
	})

	it('replaces multiple variables with the same name', () => {
		const variables = {
			"MY_VALUE": "123",
			"MY_OTHER_VALUE": "456"
		}

		const str = "Hello [MY_VALUE] and [MY_VALUE]"
		const expected = "Hello 123 and 123"
		const actual = fillVariablesIntoString(str, variables)
		expect(actual).toEqual(expected)
	})

	it('replaces variables in objects', () => {
		const variables = {
			"MY_VALUE": "123",
			"MY_OTHER_VALUE": "456"
		}

		const obj = {
			"key": "Hello [MY_VALUE] and [MY_OTHER_VALUE]"
		}

		const expected = {
			"key": "Hello 123 and 456"
		}

		const actual = fillVariablesIntoString(obj, variables)
		expect(actual).toEqual(expected)
	})

	it('replaces variables in an array', () => {
		const variables = {
			"MY_VALUE": "123",
			"MY_OTHER_VALUE": "456"
		}

		const arr = [
			"Hello [MY_VALUE] and [MY_OTHER_VALUE]"
		]

		expect(fillVariablesIntoString(arr, variables)).toEqual([
			'Hello 123 and 456'
		])
	})
})
