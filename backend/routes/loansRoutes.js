const express = require('express');
const validateFields = require('../middlewares/validate');
const validateId = require('../middlewares/validateId');
const controller = require('../controllers/loansController');

const router = express.Router();

router.param('id', validateId);

router.get('/', controller.getLoans);
router.post('/', validateFields(['member_id', 'book_id', 'due_date']), controller.createLoan);
router.put('/:id/return', controller.returnLoan);
router.get('/stats', controller.getStats);

module.exports = router;
