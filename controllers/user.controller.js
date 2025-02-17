import bcrypt from "bcrypt"
import User from "../models/user.model.js"
import {v2 as cloudinary} from "cloudinary"
import Notification from "../models/notification.model.js"

export let getUserProfile = async (req, res) => {
  try {
    let {username} = req.params
    let user = await User.findOne({username}).select("-password")
    if (!user) {
      return res.status(400).json({error: "user not found"})
    }
    res.json({user})
  } catch (error) {
    res.status(500).json({
      error: "Invalid Server Error",
    })
  }
}

export let followUnfollowUser = async (req, res) => {
  try {
    let {id} = req.params
    let userToModifay = await User.findById(id).select("-password")
    let userCuurant = await User.findById(req.user._id).select("-password")

    if (id == req.user._id.toString()) {
      res.status(400).json({
        error: "you can't follow your self",
      })
    }
    if (!userToModifay || !userCuurant) {
      return res.json({
        error: "Invalid following",
      })
    }

    let isfollowing = userCuurant.follwing.includes(id)
    if (isfollowing) {
      await User.findByIdAndUpdate(id, {$pull: {follwers: req.user._id}})
      await User.findByIdAndUpdate(req.user._id, {$pull: {follwing: id}})
      return res.json({
        message: "unfollowing it's successfuly",
      })
    } else {
      await User.findByIdAndUpdate(id, {$push: {follwers: req.user._id}})
      await User.findByIdAndUpdate(req.user._id, {$push: {follwing: id}})

      let notification = new Notification({
        from: req.user._id,
        to: userToModifay._id,
        type: "follow",
      })

      await notification.save()
      return res.json({
        message: "following it's successfuly",
      })
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    })
  }
}

export let suggested = async (req, res) => {
  try {
    let userId = req.user._id
    if (!userId) return res.json({error: "Invalid user"})

    let followingUser = await User.findById(userId).select("follwing")

    let users = await User.aggregate([
      {
        $match: {_id: {$ne: userId}},
      },
      {$sample: {size: 10}},
    ])

    let filter = users.filter((user) => !followingUser.follwing.includes(user._id))
    let filterSize = filter.slice(0, 4)

    filterSize.forEach((e) => (e.password = null))

    res.status(200).json(filterSize)
  } catch (error) {
    res.status(400).json({error: "Invalid Server Error"})
  }
}

export let updateUser = async (req, res) => {
  try {
    let {username, email, fullName, currentPassword, newPassword, bio, link} = req.body
    let {profileImg, coverImg} = req.body
    let userId = req.user._id

    let user = await User.findById(userId)

    if ((!currentPassword && newPassword) || (currentPassword && !newPassword)) {
      return res.status(400).json({
        error: "You need to provied us currentPassword and newPassword",
      })
    }

    if (currentPassword && newPassword) {
      let isPasswordCorrect = await bcrypt.compare(currentPassword, user?.password || "")
      if (!isPasswordCorrect) return res.status(400).json({error: "current Password is incorrect"})
      if (newPassword.length < 6) return res.status(400).json({error: "new password less than 6 character"})

      let salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(newPassword, salt)
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
      }

      const uploadResultProfile = await cloudinary.uploader.upload(`${profileImg}`)
      profileImg = uploadResultProfile.secure_url
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0])
      }
      const uploadResultCover = await cloudinary.uploader.upload(`${coverImg}`)
      coverImg = uploadResultCover.secure_url
    }

    user.username = username || user.username
    user.fullName = fullName || user.fullName
    user.email = email || user.email
    user.bio = bio || user.bio
    user.link = link || user.link
    user.profileImg = profileImg || user.profileImg
    user.coverImg = coverImg || user.coverImg

    await user.save()

    user.password = null

    return res.status(200).json(user)
  } catch (error) {
    return res.status(500).json({error: error})
  }
}
