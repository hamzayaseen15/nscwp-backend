const yup = require('yup')

const ApiHelper = require('../helpers/ApiHelper')
const UploadHelper = require('../helpers/UploadHelper')

const SupportTicket = require('../models/SupportTicket')

const { USER_TYPE_USER } = require('../constants/user')
const {
  SUPPORT_TICKET_STATUS_RESOLVED,
  SUPPORT_TICKET_STATUS_PENDING,
} = require('../constants/supportTicket')

/**
 * Get all support tickets
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.index = async (req, res) => {
  try {
    const { user } = req

    const filters = {}

    if (user.type === USER_TYPE_USER) {
      filters.created_by = user._id
    }

    const response = await ApiHelper.handleGet(
      req,
      SupportTicket,
      filters,
      null,
      {
        path: 'created_by',
        select: 'email name photo',
        populate: 'photo',
      }
    )
    return res.status(200).json(response)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

/**
 * Get one support ticket by id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.show = async (req, res) => {
  try {
    const {
      params: { id },
      user,
    } = req

    const supportTicket = await SupportTicket.findOne({ _id: id }).populate(
      'files'
    )

    if (!supportTicket) {
      return res.status(404).json({ message: 'SupportTicket not found' })
    }

    if (
      user.type === USER_TYPE_USER &&
      supportTicket.created_by.toString() !== user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to access this resource' })
    }

    return res.status(200).json(supportTicket)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

/**
 * Create a new support ticket
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.store = async (req, res) => {
  try {
    const { user, body, files } = req

    const schema = yup.object().shape({
      name: yup.string().required(),
      description: yup.string().required(),
      files: yup.mixed().nullable(),
      status: yup
        .string()
        .oneOf([
          SUPPORT_TICKET_STATUS_PENDING,
          SUPPORT_TICKET_STATUS_RESOLVED,
          null,
          undefined,
        ]),
    })

    const validationErrors = await req.validate(schema)
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: validationErrors })
    }

    const data = {
      ...body,
      files: [],
      created_by: user._id,
    }

    if (files?.files?.length > 0) {
      for (let fileIdx = 0; fileIdx < files.files.length; fileIdx++) {
        const { file } = await UploadHelper.handleDocument(
          req,
          `files[${fileIdx}]`,
          '/public/support-tickets/'
        )
        data.files.push(file._id)
      }
    } else if (files?.files) {
      const { file } = await UploadHelper.handleDocument(
        req,
        `files`,
        '/public/support-tickets/'
      )

      data.files.push(file._id)
    }

    const supportTicket = await SupportTicket.create(data)

    return res.status(201).json(supportTicket)
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}

/**
 * Update an support ticket
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.update = async (req, res) => {
  try {
    const {
      body,
      files,
      params: { id },
      user,
    } = req

    const supportTicket = await SupportTicket.findOne({ _id: id })

    if (!supportTicket) {
      return res.status(404).json({ message: 'SupportTicket not found' })
    }

    console.log({
      created_by: supportTicket.created_by,
      user: user._id,
    })

    if (
      user.type === USER_TYPE_USER &&
      supportTicket.created_by.toString() !== user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to access this resource' })
    }

    const schema = yup.object().shape({
      name: yup.string().required(),
      description: yup.string().required(),
      status: yup
        .string()
        .oneOf([
          SUPPORT_TICKET_STATUS_PENDING,
          SUPPORT_TICKET_STATUS_RESOLVED,
          null,
          undefined,
        ]),
    })

    const validationErrors = await req.validate(schema)
    if (validationErrors) {
      return res
        .status(400)
        .json({ message: 'Validation Error', errors: validationErrors })
    }

    const data = {
      ...body,
      files: supportTicket.files,
    }

    if (files) {
      for (let fileIdx = 0; fileIdx < supportTicket.files.length; fileIdx++) {
        const file = supportTicket.files[fileIdx]
        await UploadHelper.handleDeleteDocument(file)
      }

      data.files = []

      if (files?.files?.length > 0) {
        for (let fileIdx = 0; fileIdx < files.files.length; fileIdx++) {
          const { file } = await UploadHelper.handleDocument(
            req,
            `files[${fileIdx}]`,
            '/public/support-tickets/'
          )
          data.files.push(file._id)
        }
      } else if (files?.files) {
        const { file } = await UploadHelper.handleDocument(
          req,
          `files`,
          '/public/support-tickets/'
        )

        data.files.push(file._id)
      }
    }

    const updateResponse = await SupportTicket.findOneAndUpdate(
      { _id: id },
      { $set: data },
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
 * Delete an support ticket by id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
exports.destroy = async (req, res) => {
  try {
    const {
      user,
      params: { id },
    } = req

    const supportTicket = await SupportTicket.findOne({ _id: id })

    if (!supportTicket) {
      return res.status(404).json({ message: 'SupportTicket not found' })
    }

    if (
      user.type === USER_TYPE_USER &&
      supportTicket.created_by.toString() !== user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: 'You are not allowed to access this resource' })
    }

    for (let fileIdx = 0; fileIdx < supportTicket.files.length; fileIdx++) {
      const file = supportTicket.files[fileIdx]
      await UploadHelper.handleDeleteDocument(file)
    }

    await SupportTicket.findByIdAndDelete({ _id: id })

    return res.status(200).json({ message: 'Deleted successfully' })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ message: error?.message ?? 'Something went wrong' })
  }
}
