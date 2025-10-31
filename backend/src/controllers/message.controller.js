import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import imagekit from "../lib/imageKit.js";
import { getRecieverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUser },
    }).select("-password");

    // Get last message for each user
    const usersWithLastMessage = await Promise.all(
      filteredUsers.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUser, recieverId: user._id },
            { senderId: user._id, recieverId: loggedInUser },
          ],
        })
          .sort({ createdAt: -1 })
          .select("text image video senderId createdAt isDeleted");

        // Count unread messages from this user
        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          recieverId: loggedInUser,
          seen: false,
        });

        return {
          ...user.toObject(),
          lastMessage,
          unreadCount,
        };
      })
    );

    // Sort users by last message time (most recent first)
    usersWithLastMessage.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || new Date(0);
      const bTime = b.lastMessage?.createdAt || new Date(0);
      return new Date(bTime) - new Date(aTime);
    });

    res.status(200).json(usersWithLastMessage);
  } catch (error) {
    console.log("Error in getUsersForSidebar: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Just fetch messages WITHOUT automatically marking as seen
    const messages = await Message.find({
      $or: [
        { senderId: myId, recieverId: userToChatId },
        { senderId: userToChatId, recieverId: myId },
      ],
    })
      .populate("replyTo", "text image video senderId isDeleted")
      .sort({ createdAt: 1 }); // Sort by creation time

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessage controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, video, replyTo } = req.body;
    const { id: recieverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    let videoUrl;

    if (image) {
      // Remove data:image/jpeg;base64, prefix if present
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");

      const uploadResponse = await imagekit.upload({
        file: base64Data,
        fileName: `message_${senderId}_${Date.now()}.jpg`,
        folder: "/messageImages",
      });
      imageUrl = uploadResponse.url;
    }

    if (video) {
      // Remove data:video/mp4;base64, prefix if present
      const base64Data = video.replace(/^data:video\/[a-z0-9]+;base64,/, "");

      const uploadResponse = await imagekit.upload({
        file: base64Data,
        fileName: `message_${senderId}_${Date.now()}.mp4`,
        folder: "/messageVideos",
      });
      videoUrl = uploadResponse.url;
    }

    const newMessage = new Message({
      senderId,
      recieverId,
      text,
      image: imageUrl,
      video: videoUrl,
      replyTo: replyTo || null,
    });

    await newMessage.save();

    const recieverSocketId = getRecieverSocketId(recieverId);
    if (recieverSocketId) {
      io.to(recieverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in SendMessage controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const myId = req.user._id;

    // Mark all unseen messages from the sender as seen
    const result = await Message.updateMany(
      {
        senderId: senderId,
        recieverId: myId,
        seen: false,
      },
      {
        seen: true,
        seenAt: new Date(),
      }
    );

    // Emit seen status update to the sender
    const senderSocketId = getRecieverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", {
        userId: myId,
        chatId: senderId,
        count: result.modifiedCount,
      });
    }

    res.status(200).json({
      message: "Messages marked as seen",
      count: result.modifiedCount,
    });
  } catch (error) {
    console.log("Error in markMessagesAsSeen controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete their own message
    if (message.senderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own messages" });
    }

    // Mark message as deleted instead of actually deleting it
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.text = null;
    message.image = null;
    message.video = null;

    await message.save();

    // Emit delete event to receiver
    const receiverSocketId = getRecieverSocketId(message.recieverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
