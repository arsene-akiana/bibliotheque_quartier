const express = require('express');
const validateFields = require('../middlewares/validate');
const validateId = require('../middlewares/validateId');
const controller = require('../controllers/authorsController');

const router = express.Router();

router.param('id', validateId);

router.get('/', controller.getAuthors);
router.post('/', validateFields(['name', 'nationality']), controller.createAuthor);
router.put('/:id', validateFields(['name', 'nationality']), controller.updateAuthor);
router.delete('/:id', controller.deleteAuthor);

module.exports = router;
