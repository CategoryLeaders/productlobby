// Jest Setup File
// Configures Jest with mocks and global test utilities

jest.mock('@/lib/db', () => ({
  prisma: {
    campaign: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    pledge: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    lobby: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    comment: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    share: {
      create: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    favourite: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    brandTeam: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

// Set default test timeout
jest.setTimeout(10000)
