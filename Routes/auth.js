const user = require("../Models/user");
const express = require("express");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const router = express.Router();
const verifyJwt = require("../Middleware/authMiddleware")


router.post("/register", async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "bad request" });
        }

        const isExistingUser = await user.findOne({ email: email })
        if (isExistingUser) {
            return res.status(409).json({ message: "User already exists" })
        }

        if (password !== confirmPassword) {
            return res.status(401).json({ message: "Password not matched" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userData = new user({
            name,
            email,
            password: hashedPassword,
            confirmPassword: hashedPassword,
        })

        const userResponse = await userData.save();

        const token = await jwt.sign(
            { userId: userResponse._id },
            process.env.JWT_SECRET)

        return res.status(200).json(
            { message: "user created successfully", token: token, name: name, id: userResponse._id });

    }
    catch (err) {
        console.log("Something went wrong", err);
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "bad request" });
        }

        const userDetails = await user.findOne({ email })
        if (!userDetails) {
            return res.status(401).json({ message: "User doesn't exist" });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            userDetails.password
        )

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = await jwt.sign(
            { userId: userDetails._id },
            process.env.JWT_SECRET
        )
        return res.status(200).json(
            { message: "user logged in successfully", token: token, name: userDetails.name,  id: userDetails._id});
    }
    catch (err) {
        res.status(400).json({message: "something went wrong"},err);
        console.log(err);
    }

})

router.put("/changePassword", verifyJwt, async (req, res) => {
    try {

        const {name, oldPassword, newPassword, newName} = req.body;
        if (!name || !oldPassword || !newPassword || !newName) {
            return res.status(400).json({ message: "bad request" });
        }

        let userData = await user.findOne({name});
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, userData.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect old password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        userData.password = hashedPassword;
        userData.name = newName;
        await userData.save();

        res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (err) {
        console.log(err)
        res.status(401).json({ message: "Something went wrong" })
    }
})

module.exports = router;