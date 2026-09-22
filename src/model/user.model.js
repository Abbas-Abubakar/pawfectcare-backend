import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
    minLength: 8
  },
  role: {
    type: String,
    enum: ["pet_owner", "Veterinarian", "shelter_admin"],
    required: [true, "Role is required"]
  },
  photo: {
    type: String,
    default: ""
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    select: false
  },
  otpExpires: {
    type: Date,
    select: false
  },
  otpLastSentAt: {
    type: Date,
    select: false
  },
  loginAttempts: {
    type: Number,
    default: 0,
    select: false,
  },
  loginLockUntil: {
    type: Date,
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetTokenExpires: {
    type: Date,
    select: false
  }
},{
  timestamps: true
}
)

userSchema.pre("save", async function() {
  if(!this.isModified("password")) return

  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.pre(/^find/, function(){
  this.find({isActive: {$ne: false}})
})

userSchema.methods.matchPassword = async function(password) {
  return bcrypt.compare(password, this.password)
}

userSchema.methods.isPasswordChanged = async function(JWTTimestamp){
  if(this.passwordChangedAt){
    const passwordChangedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)

    return JWTTimestamp < passwordChangedTimestamp
  }

  return false
}

userSchema.methods.createResestToken = function(){
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000
  return resetToken
}


userSchema.methods.toSafeObject = function(){
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    photo: this.photo,
    isActive: this.isActive,
    isVerified: this.isVerified,
    createdAt: this.createdAt
  }
}

const User = mongoose.model("User", userSchema)

export default User