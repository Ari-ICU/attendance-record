const express = require('express');
const router = express.Router();
const PositionController = require('../controllers/position.controller');
const { authMiddleware, adminOnly } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', PositionController.getAll);
router.get('/:id', PositionController.getById);
router.post('/', adminOnly, PositionController.create);
router.put('/:id', adminOnly, PositionController.update);
router.delete('/:id', adminOnly, PositionController.delete);

module.exports = router;
