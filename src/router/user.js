const express = require('express')

const UserController = require('../controllers/user')

const router = express.Router()

router.get('/', UserController.index)

router.get('/me', UserController.me)

router.get('/notifications', UserController.notifications)

router.get('/:id', UserController.show)

router.post('/', UserController.store)

router.put('/:id', UserController.update)

router.delete('/:id', UserController.destroy)

module.exports = router
