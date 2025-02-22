const express = require('express');
const User = require('./user.model');
const generateToken = require('../middleware/generateToken');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const router = express.Router();

// Register endpoint
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email, password });
        await user.save();
        res.status(200).send({ message: "User registerd successfully" })
    } catch (error) {
        console.error("An Error occured in registeration section", error);
        res.status(500).send({ message: "An Error occured in registeration section" })
    }
})
//


// Login endpoint
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).send({ message: "User does not exist" })
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).send({ message: "Password is not correct" })
        }

        // generate token
        const token = await generateToken(user._id);

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        })
        //

        res.status(200).send({
            message: "User logged in successfully", token, user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                profileImage: user.profileImage,
                bio: user.bio,
                profession: user.profession
            }
        })
    } catch (error) {
        console.error("An Error occured in login section", error);
        res.status(500).send({ message: "An Error occured in login section" })
    }
})
//

// Logout endpoin
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).send({ message: "User logged out successfully" })
})
//

// delete user
router.delete('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {

        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        res.status(200).send({ message: "User deleted successfully" })

    } catch (error) {
        console.error("An Error occured in delete user section", error);
        res.status(500).send({ message: "An Error occured in delete user section" })
    }
})
//

// get all users
router.get('/users', verifyToken, verifyAdmin, async (req, res) => {
    try {

        const users = await User.find({}, 'id email role').sort({ createdAt: -1 });
        res.status(200).send(users);

    } catch (error) {
        console.error("An Error occured in fetching users", error);
        res.status(500).send({ message: "An Error occured in fetching users" })
    }
})
//

// update user role
router.put('/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {

        const { id } = req.params;
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(id, { role }, { new: true });

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        res.status(200).send({ message: "User's roel updated successfully", user })

    } catch (error) {
        console.error("An Error occured in updating user role", error);
        res.status(500).send({ message: "An Error occured in updating user role" })
    }
})
//

// update profile
router.patch('/edit-profile', verifyToken, async (req, res) => {
    try {

        const { userId, username, profileImage, bio, profession } = req.body;

        if (!userId) {
            return res.status(400).send({ message: "UserID is required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        if (username !== undefined) user.username = username;
        if (profileImage !== undefined) user.profileImage = profileImage;
        if (bio !== undefined) user.bio = bio;
        if (profession !== undefined) user.profession = profession;

        await user.save();

        res.status(200).send({
            message: "Profile updated successfully", user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                profileImage: user.profileImage,
                bio: user.bio,
                profession: user.profession
            }
        })

    } catch (error) {
        console.error("An Error occured in updating user's profile", error);
        res.status(500).send({ message: "An Error occured in updating user's profile" })
    }
})
//

module.exports = router;