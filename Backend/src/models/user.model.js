import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
    firstName:{
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: 50,

    } ,
    lastName:{
        type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: 50,  
    } ,
     email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please enter a valid email address",
      ],
    },
   
       password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"], 
      default: "user",
    },

    phone: {
      type: String,
      default: null,
    },

    avatar: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
     passwordChangedAt: {
      type: Date,
      select: false,
    },
} , {
    timestamps:true
})






userSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return await bcrypt.compare(
    candidatePassword,
    this.password
  );
};



userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
});


//this function checks whether a user changed their password after a JWT token was created.
//when the user changes his password ,we force him to login again
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp =
      parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

const User = mongoose.model("User", userSchema);

export default User;