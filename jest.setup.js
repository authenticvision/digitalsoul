// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

jest.mock("./lib/prisma", () => {
  return jestPrisma.client
})

import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
