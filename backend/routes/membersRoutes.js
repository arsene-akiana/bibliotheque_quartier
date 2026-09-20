const express = require('express');
const validateFields = require('../middlewares/validate');
const validateId = require('../middlewares/validateId');
const controller = require('../controllers/membersController');

const router = express.Router();

router.param('id', validateId);

router.get('/', controller.getMembers);
router.get('/:id/loans', controller.getMemberLoans);
router.post('/', validateFields(['name', 'contact']), controller.createMember);
router.put('/:id', validateFields(['name', 'contact']), controller.updateMember);
router.delete('/:id', controller.deleteMember);

module.exports = router;
