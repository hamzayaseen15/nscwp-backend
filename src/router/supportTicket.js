const express = require('express')

const SupportTicketController = require('../controllers/supportTicket')

const router = express.Router()

router.get('/', SupportTicketController.index)

router.get('/:id', SupportTicketController.show)

router.post('/', SupportTicketController.store)

router.put('/:id', SupportTicketController.update)

router.delete('/:id', SupportTicketController.destroy)

module.exports = router
