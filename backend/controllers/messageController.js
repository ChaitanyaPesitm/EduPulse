/**
 * Message Controller – Student ↔ Teacher messaging
 */
const Message = require('../models/Message');
const User = require('../models/User');

// @desc   Send a message
// @route  POST /api/messages
// @access Private
const sendMessage = async (req, res, next) => {
    try {
        const { receiverId, message } = req.body;

        if (!receiverId || !message) {
            return res.status(400).json({ success: false, message: 'receiverId and message are required' });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ success: false, message: 'Recipient not found' });
        }

        const newMessage = await Message.create({
            senderId: req.user._id,
            receiverId,
            message,
        });

        await newMessage.populate('senderId', 'name role');
        await newMessage.populate('receiverId', 'name role');

        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        next(error);
    }
};

// @desc   Get conversation between two users
// @route  GET /api/messages/:otherUserId
// @access Private
const getConversation = async (req, res, next) => {
    try {
        const myId = req.user._id;
        const otherId = req.params.otherUserId;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: otherId },
                { senderId: otherId, receiverId: myId },
            ],
        })
            .populate('senderId', 'name role')
            .populate('receiverId', 'name role')
            .sort({ createdAt: 1 });

        // Mark received messages as read
        await Message.updateMany(
            { senderId: otherId, receiverId: myId, isRead: false },
            { isRead: true }
        );

        res.json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
};

// @desc   Get all conversation partners for current user
// @route  GET /api/messages
// @access Private
const getConversationList = async (req, res, next) => {
    try {
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [{ senderId: myId }, { receiverId: myId }],
        }).sort({ createdAt: -1 });

        // Get unique partner IDs
        const partnerIds = new Set();
        messages.forEach((m) => {
            if (m.senderId.toString() !== myId.toString()) partnerIds.add(m.senderId.toString());
            if (m.receiverId.toString() !== myId.toString()) partnerIds.add(m.receiverId.toString());
        });

        const partners = await User.find({ _id: { $in: Array.from(partnerIds) } }).select('name email role');
        res.json({ success: true, partners });
    } catch (error) {
        next(error);
    }
};

module.exports = { sendMessage, getConversation, getConversationList };
