const express = require('express')

const CommunityController = require('../controllers/community')

const router = express.Router()

router.get('/', CommunityController.index)

router.get('/:id', CommunityController.show)

router.post('/', CommunityController.store)

router.put('/:id', CommunityController.update)

router.delete('/:id', CommunityController.destroy)

module.exports = router
