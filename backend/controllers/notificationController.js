import notificationModel from "../models/notificationModel.js";

const createNotification = async (
  senderId,
  receiverId,
  appointmentId,
  type,
  message
) => {
  try {
    const notification = new notificationModel({
      senderId,
      receiverId,
      appointmentId,
      type,
      message,
    });
    await notification.save();
  } catch (error) {
    console.error("Error creating notification:", error.message);
    throw error;
  }
};

const getNotifications = async (req, res) => {
  try {
    let userId = req.body.userId ?? req.body.docId;

    const notifications = await notificationModel
      .find({ receiverId: userId })
      .populate("appointmentId", "slotTime slotDate")
      .sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.json({ success: false, message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    let notificationId = req.params.notificationId;
    await notificationModel.findByIdAndUpdate(notificationId, {
      isRead: true,
    });
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    res.json({ success: false, message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    let userId = req.body.userId ?? req.body.docId;
    await notificationModel.updateMany(
      { receiverId: userId },
      { isRead: true }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error.message);
    res.json({ success: false, message: error.message });
  }
};

export { createNotification, getNotifications, markAsRead, markAllAsRead };
