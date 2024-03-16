const Notification = require('../models/Notification')
const {
  NOTIFICATION_STATUS_UNREAD,
} = require('../constants/notification')
/**
 * @class UploadHelper
 * @description Upload files helper
 */
module.exports = class NotificationHelper {
  /**
   * send notification to user
   * @param {string} userId
   * @param {string} title
   * @param {string} message
   * @param {"read" | "unread"} status
   * @returns
   */
  static generateNotification = async (
    userId,
    title,
    message,
    refModel,
    refId,
    status = NOTIFICATION_STATUS_UNREAD
  ) => {
    const notificationObject = {
      title,
      message,
      status,
      user: userId,
    }

    if (refModel) {
      notificationObject.ref_model = refModel
      notificationObject.ref = refId
    }
    const notification = await Notification.create(notificationObject)

    return notification
  }
}
