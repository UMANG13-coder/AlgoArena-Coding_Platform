const User = require("../models/users");
const { uploadImage } = require("../utils/helper");
async function createNewUser(userData) {
  try {
    const { name, email, password, google_id, avatar_url } = userData;
    let newUser = await User.create({
      name,
      email,
      password,
      google_id
    });

    if (avatar_url) {
      let finalAvatarUrl;

      if (google_id) {
        finalAvatarUrl = avatar_url;
      } else {

        const uploadRes = await uploadImage(
          avatar_url,
          newUser._id.toString()
        );

        finalAvatarUrl = uploadRes?.data?.fullPath;
      }

      newUser.avatar_url = finalAvatarUrl;
    }

    await newUser.save();

    return newUser;
  } catch (err) {
    throw new Error(err);
  }
}


module.exports = {
  createNewUser
};