// Regras de negócio para usuários
const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');

/**
 * Lista usuários com metadados de paginação.
 */
async function listUsers({ limit, offset, search }) {
  const { rows, total } = await userRepository.findAll({ limit, offset, search });
  return { data: rows, total };
}

/**
 * Retorna um usuário por ID (404 se não existir).
 */
async function getUser(id) {
  const user = await userRepository.findById(id);
  if (!user) {
    const err = new Error('Usuário não encontrado');
    err.status = 404;
    throw err;
  }
  return user;
}

/**
 * Cria usuário com hash de senha; garante e-mail único.
 */
async function createUser({ name, email, password }) {
  const exists = await userRepository.findByEmail(email);
  if (exists) {
    const err = new Error('E-mail já cadastrado');
    err.status = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const created = await userRepository.create({ name, email, passwordHash });
  return created;
}

/**
 * Atualiza dados do usuário; re-hash se senha informada.
 */
async function updateUser(id, { name, email, password }) {
  let passwordHash;
  if (password !== undefined) {
    passwordHash = await bcrypt.hash(password, 10);
  }
  const updated = await userRepository.update(id, { name, email, passwordHash });
  if (!updated) {
    const err = new Error('Usuário não encontrado');
    err.status = 404;
    throw err;
  }
  return updated;
}

/**
 * Remove usuário por ID (404 se não existir).
 */
async function deleteUser(id) {
  const ok = await userRepository.remove(id);
  if (!ok) {
    const err = new Error('Usuário não encontrado');
    err.status = 404;
    throw err;
  }
}

/**
 * Promove um usuário para admin.
 */
async function promoteUser(id) {
  const updated = await userRepository.setRole(id, 'admin');
  if (!updated) {
    const err = new Error('Usuário não encontrado');
    err.status = 404;
    throw err;
  }
  return updated;
}

/**
 * Rebaixa um usuário para role 'user'.
 */
async function demoteUser(id) {
  const before = await userRepository.findById(id);
  if (!before) {
    const err = new Error('Usuário não encontrado');
    err.status = 404;
    throw err;
  }
  if (before.role === 'admin') {
    const count = await userRepository.countAdmins();
    if (count <= 1) {
      const err = new Error('Não é permitido remover o último admin');
      err.status = 400;
      throw err;
    }
  }
  const updated = await userRepository.setRole(id, 'user');
  return updated;
}

/**
 * Define o papel do usuário explicitamente (user/admin).
 */
async function setRole(id, role) {
  const before = await userRepository.findById(id);
  if (!before) {
    const err = new Error('Usuário não encontrado');
    err.status = 404;
    throw err;
  }
  if (before.role === 'admin' && role === 'user') {
    const count = await userRepository.countAdmins();
    if (count <= 1) {
      const err = new Error('Não é permitido remover o último admin');
      err.status = 400;
      throw err;
    }
  }
  const updated = await userRepository.setRole(id, role);
  return updated;
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser, promoteUser, demoteUser, setRole };
