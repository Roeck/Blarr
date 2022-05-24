const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const UserModel = require("../models/UserModel")
const PostModel = require("../models/PostModel")
const FollowerModel = require("../models/FollowerModel")

// CREATE A POST

router.post("/", authMiddleware, async (req, res) => {
    const { text, location, picUrl } = req.body;

    if (text.length < 1) return res.status(401).send("Text must be atleast 1 character");

    try {
        const newPost = {
            user: req.userId,
            text
        };
        if (location) newPost.location = location;
        if (picUrl) newPost.picUrl = picUrl;

        const post = await new PostModel(newPost).save()

        return res.json(post)
    } catch (error) {
        console.error(error)
        return res.status(500).send(`Server error`)
    }
});

// GET ALL POSTS

router.get("/", authMiddleware, async (req, res) => {
    try {
        const posts = await PostModel.find()
            .sort({ createdAt: -1 })
            .populate("user")
            .populate("comments.user")

        return res.json(posts)
    } catch (error) {
        console.error(error)
        return res.status(500).send(`Server error`)
    }
})

// GET POST BY ID

router.get("/:postId", authMiddleware, async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.postId)
            .populate("user")
            .populate("comments.user")

        if (!post) {
            return res.status(404).send("Post not found")
        }

        return res.json(post)
    } catch (error) {
        console.error(error)
        return res.status(500).send(`Server error`)
    }
})

// DELETE POST

router.delete("/:postId", authMiddleware, async (req, res) => {
    try {
        const { userId } = req;

        const { postId } = req.params;

        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).send("post not found");
        }

        const deletePost = async () => {
            await post.remove();
            return res.status(200).send("Post deleted Successfully");
        };

        if (post.user.toString() !== userId) {
            const user = await UserModel.findById(userId);
            if (user.role === "root") {
                await deletePost();
            } else {
                return res.status(401).send("Unauthorized");
            }
        }

        await deletePost();
    } catch (error) {
        console.error(error);
        return res.status(500).send(`Server error`);
    }
});

// LIKE A POST

router.post("/like/:postId", authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId } = req;

        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).send("No Post found");
        }

        const isLiked =
            post.likes.filter(like => like.user.toString() === userId).length > 0;

        if (isLiked) {
            return res.status(401).send("Post already liked");
        }

        await post.likes.unshift({ user: userId });
        await post.save();

        const postByUserId = post.user.toString();

        if (postByUserId !== userId) {
            await newLikeNotification(userId, postId, postByUserId);
        }

        return res.status(200).send("Post liked");
    } catch (error) {
        console.error(error);
        return res.status(500).send(`Server error`);
    }
});

module.exports = router