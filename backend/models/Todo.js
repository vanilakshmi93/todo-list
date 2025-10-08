const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    dueDate: Date,
    status: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", todoSchema);