const mongoose = require('mongoose');
const {Schema} = mongoose;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    google_id:{
        type: String,
    },
    role:{
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    avatar_url: {
      type: String,
    },
    stats:{
      type: Object,
      default: {
      }
    }
}, { timestamps: true });


userSchema.pre('save', async function(next) {

  if (this.google_id && !this.password) {
      return 
    }

    if (!this.isModified('password')) {
    return 
    }

  try {
    const salt = await bcrypt.genSalt(10);
    console.log("Hashing password for user:", this.email);
    this.password = await bcrypt.hash(this.password, salt);
    return 
  } catch (err) {
    console.log("Error hashing password:", err);
    throw(err);
  }
});

userSchema.pre('findOneAndUpdate', async function() {
  const update = this.getUpdate();
  if ((update.password || (update.$set && update.$set.password)))  {
    const password = update.password || update.$set.password;
    

    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      if (update.$set) {
        update.$set.password = hashedPassword;
      } else {
        update.password = hashedPassword;
      }
    }
  }
});


const User = mongoose.model('User', userSchema);



module.exports = User;
