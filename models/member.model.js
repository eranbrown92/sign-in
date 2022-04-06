const mongoose = require("mongoose");
const { Schema } = mongoose;

const memberSchema = new Schema({
  username: { type: String, required: true },
  hash: { type: String, required: true },
});

module.exports = Member = mongoose.model("Member", memberSchema);
