const userService = require('../../src/services/userService');

jest.mock('../../src/repositories/userRepository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(async () => 'hashed'),
}));

const repo = require('../../src/repositories/userRepository');

describe('userService', () => {
  afterEach(() => jest.clearAllMocks());

  test('createUser - conflicts on existing email', async () => {
    repo.findByEmail.mockResolvedValue({ id: 1, email: 'a@a.com' });
    await expect(userService.createUser({ name: 'A', email: 'a@a.com', password: 'Password123' }))
      .rejects.toHaveProperty('status', 409);
  });

  test('createUser - hashes password and creates', async () => {
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockResolvedValue({ id: 2, name: 'B', email: 'b@b.com' });
    const res = await userService.createUser({ name: 'B', email: 'b@b.com', password: 'Password123' });
    expect(res).toMatchObject({ id: 2, email: 'b@b.com' });
    expect(repo.create).toHaveBeenCalled();
  });
});

