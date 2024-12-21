const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    type: {
      type: String,
    },
    category: {
      type: String,
    },
    subCategory: {
      type: String,
    },
    tags: [{ type: String }],
    image: {
      type: String,
    },
    share: {
      type: Number,
      default: 0,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    author: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.index({
  title: "text",
  tag: "text",
  category: "text",
  subCategory: "text",
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = { Blog };
