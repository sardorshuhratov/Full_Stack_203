const express = require('express');
const { getAllUsers, getUserById, addNewUser, updateUser, deleteUser} = require('../controllers/useController');
const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', addNewUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;