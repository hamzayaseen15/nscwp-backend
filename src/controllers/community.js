const yup = require('yup')

const ApiHelper = require('../helpers/ApiHelper')

const Community = require('../models/Community')

const { USER_TYPE_ADMIN, USER_TYPE_SUB_ADMIN } = require('../constants/user')

/**
 * Get all communities
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.index = async (req, res) => {
  try {
    const response = await ApiHelper.handleGet(req, Community)
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

/**
 * Get one community by id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.show = async (req, res) => {
  try {
    const {
      params: { id },
    } = req

    const community = await Community.findOne({ _id: id })

    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    return res.status(200).json(community)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

/**
 * Create a new community
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.store = async (req, res) => {
  try {
    const { user, body } = req

    if (![USER_TYPE_ADMIN, USER_TYPE_SUB_ADMIN].includes(user.type)) {
      return res.status(403).json({ message: 'Forbidden resource' })
    }

    const schema = yup.object().shape({
      name: yup.string().required(),
      description: yup.string().nullable(),
    })

    const validationErrors = await req.validate(schema)
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: validationErrors })
    }

    const community = await Community.create(body)

    return res.status(201).json(community)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

/**
 * Update an community
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.update = async (req, res) => {
  try {
    const {
      user,
      params: { id },
      body,
    } = req

    const community = await Community.findOne({ _id: id })

    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    if (![USER_TYPE_ADMIN, USER_TYPE_SUB_ADMIN].includes(user.type)) {
      return res.status(403).json({ message: 'Forbidden resource' })
    }

    const schema = yup.object().shape({
      name: yup.string().required(),
      description: yup.string().nullable(),
    })

    const validationErrors = await req.validate(schema)
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: validationErrors })
    }

    const updateResponse = await Community.findOneAndUpdate(
      { _id: id },
      { $set: body },
      { new: true, useFindAndModify: false }
    )

    return res.status(200).json(updateResponse)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Error updating user' })
  }
}

/**
 * Delete an community by id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.destroy = async (req, res) => {
  try {
    const {
      user,
      params: { id },
    } = req

    const community = await Community.findOne({ _id: id })

    if (!community) {
      return res.status(404).json({ message: 'Community not found' })
    }

    if (![USER_TYPE_ADMIN, USER_TYPE_SUB_ADMIN].includes(user.type)) {
      return res.status(403).json({ message: 'Forbidden resource' })
    }

    await Community.findByIdAndDelete({ _id: id })

    return res.status(200).json({ message: 'Deleted successfully' })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}
