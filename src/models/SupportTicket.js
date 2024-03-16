const mongoose = require('mongoose')
const {
  SUPPORT_TICKET_STATUS_PENDING,
  SUPPORT_TICKET_STATUS_RESOLVED,
} = require('../constants/supportTicket')

const Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    files: {
      type: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: [SUPPORT_TICKET_STATUS_PENDING, SUPPORT_TICKET_STATUS_RESOLVED],
      default: SUPPORT_TICKET_STATUS_PENDING,
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

const SupportTicket = mongoose.model('SupportTicket', Schema, 'support_tickets')

module.exports = SupportTicket
