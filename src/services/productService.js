// Regras de negócio para produtos
const productRepository = require('../repositories/productRepository');

/** Lista produtos com metadados de paginação. */
async function listProducts({ limit, offset, search }) {
  const { rows, total } = await productRepository.findAll({ limit, offset, search });
  return { data: rows, total };
}

/** Retorna um produto por ID (404 se não existir). */
async function getProduct(id) {
  const product = await productRepository.findById(id);
  if (!product) {
    const err = new Error('Produto não encontrado');
    err.status = 404;
    throw err;
  }
  return product;
}

/** Cria um novo produto. */
async function createProduct({ name, price }) {
  return await productRepository.create({ name, price });
}

/** Atualiza dados do produto. */
async function updateProduct(id, { name, price }) {
  const updated = await productRepository.update(id, { name, price });
  if (!updated) {
    const err = new Error('Produto não encontrado');
    err.status = 404;
    throw err;
  }
  return updated;
}

/** Remove produto por ID (404 se não existir). */
async function deleteProduct(id) {
  const ok = await productRepository.remove(id);
  if (!ok) {
    const err = new Error('Produto não encontrado');
    err.status = 404;
    throw err;
  }
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
