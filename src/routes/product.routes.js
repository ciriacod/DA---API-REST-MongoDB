const { Router } = require('express');
const ctrl = require('../controllers/product.controller');
const { protect, authorize } = require('../middlewares/auth');

const router = Router();
router.get('/', ctrl.listProducts);
router.get('/:id', ctrl.getProduct);
router.post('/', protect, authorize('admin'), ctrl.createProduct);
router.put('/:id', protect, authorize('admin'), ctrl.updateProduct);

module.exports = router;
