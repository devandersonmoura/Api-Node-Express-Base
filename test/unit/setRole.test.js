const userService = require('../../src/services/userService');

jest.mock('../../src/repositories/userRepository', () => ({
  findById: jest.fn(),
  setRole: jest.fn(),
  countAdmins: jest.fn()
}));

const repo = require('../../src/repositories/userRepository');

describe('userService.setRole protections', () => {
  afterEach(() => jest.clearAllMocks());

  test('cannot remove last admin', async () => {
    repo.findById.mockResolvedValue({ id: 1, role: 'admin' });
    repo.countAdmins.mockResolvedValue(1);
    await expect(userService.setRole(1, 'user')).rejects.toHaveProperty('status', 400);
  });

  test('demote admin when more than one admin', async () => {
    repo.findById.mockResolvedValue({ id: 2, role: 'admin' });
    repo.countAdmins.mockResolvedValue(3);
    repo.setRole.mockResolvedValue({ id: 2, role: 'user' });
    const res = await userService.setRole(2, 'user');
    expect(res).toEqual({ id: 2, role: 'user' });
  });
});

