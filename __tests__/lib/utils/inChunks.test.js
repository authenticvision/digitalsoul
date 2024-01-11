import { inChunks } from '@/lib/utils'

describe('utils.inChunks', () => {
  test('should split the array into chunks of the specified size', () => {
    const inputArray = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    const chunkSize = 3
    const expectedResult = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ]

    const result = inChunks(inputArray, chunkSize)
    expect(result).toEqual(expectedResult)
  })

  test('should handle an empty array', () => {
    const inputArray = []
    const chunkSize = 3
    const expectedResult = []

    const result = inChunks(inputArray, chunkSize)
    expect(result).toEqual(expectedResult)
  })

  test('should handle an array with a length less than the chunk size', () => {
    const inputArray = [1, 2]
    const chunkSize = 3
    const expectedResult = [[1, 2]]

    const result = inChunks(inputArray, chunkSize)
    expect(result).toEqual(expectedResult)
  })
})
