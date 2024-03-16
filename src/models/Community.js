const mongoose = require('mongoose')

const Schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
)

const Community = mongoose.model('Community', Schema, 'communities')

module.exports = Community
