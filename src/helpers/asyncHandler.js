// Envolve handlers async para encaminhar erros ao errorHandler
module.exports = function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
};
