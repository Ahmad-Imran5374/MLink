import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import imagekit from "../lib/imageKit.js";
import { getRecieverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const logginedUser = req.user._id;
    const filteredUser = await User.find({ _id: { $ne: logginedUser } }).select(
      "-password"
    );

    res.status(200).json(filteredUser);
  } catch (error) {
    console.log("Error in getUsersForSidebar: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, recieverId: userToChatId },
        { senderId: userToChatId, recieverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessage controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: recieverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
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

    const newMessage = new Message({
      senderId,
      recieverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const recieverSocketId = getRecieverSocketId(recieverId);
    if(recieverSocketId){
      io.to(recieverSocketId).emit("newMessage",newMessage);
    }

    res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in SendMessage controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
