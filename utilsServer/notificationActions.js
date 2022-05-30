const UserModel = require("../models/UserModel");
const NotificationModel = require("../models/NotificationModel");

const setNotificationToUnread = async userId => {
    try {
        const user = await UserModel.findById(userId);

        if (!user.unreadNotification) {
            user.unreadNotification = true;
            await user.save();
        }

        return;
    } catch (error) {
        console.error(error);
    }
};