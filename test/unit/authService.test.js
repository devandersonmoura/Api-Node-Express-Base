const authService = require('../../src/services/authService');

jest.mock('../../src/repositories/userRepository', () => ({
  findByEmail: jest.fn(),
  findById: jest.fn()
}));

jest.mock('../../src/repositories/refreshTokenRepository', () => ({
  create: jest.fn(),
  findValid: jest.fn(),
  revoke: jest.fn(),
  revokeAllForUser: jest.fn()
}));

jest.mock('../../src/utils/attempts', () => ({
  isLocked: jest.fn(() => false),
  recordFailure: jest.fn(),
  recordSuccess: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(async (p, h) => p === 'ok'),
}));

const userRepo = require('../../src/repositories/userRepository');
const rtRepo = require('../../src/repositories/refreshTokenRepository');
const attempts = require('../../src/utils/attempts');

describe('authService', () => {
  afterEach(() => jest.clearAllMocks());

  test('login success returns access/refresh tokens', async () => {
    userRepo.findByEmail.mockResolvedValue({ id: 1, email: 'a@a.com', name: 'A', role: 'user', password_hash: 'hash' });
    const res = await authService.login({ email: 'a@a.com', password: 'ok' });
    expect(res).toHaveProperty('accessToken');
    expect(res).toHaveProperty('refreshToken');
    expect(attempts.recordSuccess).toHaveBeenCalledWith('a@a.com');
    expect(rtRepo.create).toHaveBeenCalled();
  });

  test('login fails when locked', async () => {
    attempts.isLocked.mockReturnValueOnce(true);
    await expect(authService.login({ email: 'a@a.com', password: 'whatever' }))
      .rejects.toHaveProperty('status', 429);
  });

  test('login invalid email records failure', async () => {
    userRepo.findByEmail.mockResolvedValue(null);
    await expect(authService.login({ email: 'x@x.com', password: 'nope' }))
      .rejects.toHaveProperty('status', 401);
    expect(attempts.recordFailure).toHaveBeenCalledWith('x@x.com');
  });

  test('login wrong password records failure', async () => {
    userRepo.findByEmail.mockResolvedValue({ id: 1, email: 'a@a.com', name: 'A', role: 'user', password_hash: 'hash' });
    await expect(authService.login({ email: 'a@a.com', password: 'bad' }))
      .rejects.toHaveProperty('status', 401);
    expect(attempts.recordFailure).toHaveBeenCalledWith('a@a.com');
  });

  test('refresh ok issues new access token', async () => {
    rtRepo.findValid.mockResolvedValue({ id: 1, user_id: 9, token: 'rt', expires_at: new Date(Date.now()+10000) });
    userRepo.findById.mockResolvedValue({ id: 9, email: 'b@b.com', name: 'B', role: 'admin' });
    const out = await authService.refresh('rt');
    expect(out).toHaveProperty('accessToken');
  });

  test('refresh invalid throws 401', async () => {
    rtRepo.findValid.mockResolvedValue(null);
    await expect(authService.refresh('bad')).rejects.toHaveProperty('status', 401);
  });

  test('logout by token calls revoke', async () => {
    await authService.logout('rtoken', undefined);
    expect(rtRepo.revoke).toHaveBeenCalledWith('rtoken');
  });

  test('logout all by user calls revokeAllForUser', async () => {
    await authService.logout(undefined, 123);
    expect(rtRepo.revokeAllForUser).toHaveBeenCalledWith(123);
  });
});

