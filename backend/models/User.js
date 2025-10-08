const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  revokedTokens: [{ type: String }],
})

// This method will be used when creating a new user
UserSchema.statics.createUser = async function (email, password) {
  try {
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = new this({
      email,
      passwordHash,
    })

    return await user.save()
  } catch (error) {
    throw error
  }
}

// Method to validate password
UserSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.passwordHash)
}

// Method to revoke a token
UserSchema.methods.revokeToken = function (token) {
  this.revokedTokens.push(token)
  return this.save()
}

// Method to check if a token is revoked
UserSchema.methods.isTokenRevoked = function (token) {
  return this.revokedTokens.includes(token)
}

module.exports = mongoose.model("User", UserSchema)