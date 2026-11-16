const { Router } = require('express');
const ctrl = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth');

const router = Router();
router.use(protect); // todas las rutas de órdenes requieren JWT
router.post('/', ctrl.createOrder);
router.get('/', ctrl.listOrders);
router.get('/:id', ctrl.getOrder);
router.patch('/:id/return', ctrl.returnOrder);

module.exports = router;
