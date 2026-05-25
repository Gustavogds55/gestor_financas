// transactionRoutes.js — Rotas protegidas de movimentações financeiras

const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { list, create, remove, summary } = require('../controllers/transactionController');

// Todas as rotas exigem autenticação
router.use(auth);

router.get('/summary', summary);   // deve vir antes de /:id para não conflitar
router.get('/', list);
router.post('/', create);
router.delete('/:id', remove);

module.exports = router;
