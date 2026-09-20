const express = require('express');
const validateFields = require('../middlewares/validate');
const validateId = require('../middlewares/validateId');
const controller = require('../controllers/booksController');

const router = express.Router();

router.param('id', validateId);

router.get('/', controller.getBooks);
router.post('/', validateFields(['title', 'author_id', 'publication_year']), controller.createBook);
router.put('/:id', validateFields(['title', 'author_id', 'publication_year']), controller.updateBook);
router.delete('/:id', controller.deleteBook);

module.exports = router;
