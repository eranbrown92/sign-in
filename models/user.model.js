const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  rank: { type: String, required: true },
  org:{ type: String, required: true }
});

module.exports = User = mongoose.model("User", userSchema);
