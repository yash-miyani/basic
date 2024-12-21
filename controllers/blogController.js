const { Blog } = require("../models/blogModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const fs = require("fs");
const path = require("path");

// Create Blog
const handleCreateBlog = async (req, res, next) => {
  try {
    const { title, type, category, subCategory, tags, author } = req.body;

    if (!req.file) {
      return next(new ApiError(400, "No image uploaded"));
    }

    const imagePath = req.file.path;

    if (!title) {
      await fs.promises.unlink(imagePath);
      return next(new ApiError(400, "Blog Title is required"));
    }

    const normalizedTags =
      typeof tags === "string"
        ? tags.startsWith("[")
          ? JSON.parse(tags)
          : tags.split(",").map((tag) => tag.trim())
        : Array.isArray(tags)
        ? tags.map((tag) => tag.trim())
        : [];

    const blog = await Blog.create({
      image: null,
      title,
      category,
      subCategory,
      author,
      type,
      tags: normalizedTags,
    });

    // Rename the file with the Blog ID
    const fileExtension = path.extname(req.file.originalname);
    const newFilename = `${blog._id}${fileExtension}`;
    const newPath = path.join("static/blog", newFilename);

    await fs.promises.rename(imagePath, newPath);

    // Update the new media path
    blog.image = newPath;
    await blog.save();

    return res
      .status(201)
      .json(new ApiResponse(200, "Blog created successfully", blog));
  } catch (error) {
    next(error);
  }
};

// Update Blog
const handleUpdateBlog = async (req, res, next) => {
  try {
    const { title, type, category, subCategory, tags, author } = req.body;

    const blogId = req.params.id;

    let blog = await Blog.findById(blogId);
    if (!blog) {
      return next(new ApiError(404, "Category not found"));
    }

    const normalizedTags =
      typeof tags === "string"
        ? tags.startsWith("[")
          ? JSON.parse(tags)
          : tags.split(",").map((tag) => tag.trim())
        : Array.isArray(tags)
        ? tags.map((tag) => tag.trim())
        : [];

    const newUpdate = {
      title,
      type,
      category,
      subCategory,
      tags: normalizedTags,
      author,
    };

    if (req.file) {
      const oldImagePath = blog.image;

      if (oldImagePath) {
        await fs.promises.unlink(oldImagePath);
      }
      const imagePath = req.file.path;
      const fileExtension = path.extname(req.file.originalname);
      const newFilename = `${blog._id}${fileExtension}`;
      const newPath = path.join("static/blog", newFilename);

      await fs.promises.rename(imagePath, newPath);

      newUpdate.image = newPath;
    }

    blog = await Blog.findOneAndUpdate({ _id: blogId }, newUpdate, {
      new: true,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Blog updated successfully", blog));
  } catch (error) {
    next(error);
  }
};

// Get All Blog
const handleGetAllBlog = async (req, res, next) => {
  const { page = 1, limit = 10, search } = req.query;
  const skip = (page - 1) * limit;

  try {
    const query = { disabled: false };

    let blogs;

    // Step 1: Search by tags
    if (search) {
      const tagQuery = {
        ...query,
        $or: [
          { tags: { $regex: new RegExp(search, "i") } },
          {
            author: { $regex: new RegExp(search, "i") },
          },
        ],
      };
      blogs = await Blog.find(tagQuery).skip(skip).limit(Number(limit)).exec();

      // Step 2: search by title if no blogs found by tags
      if (!blogs || blogs.length === 0) {
        const titleQuery = {
          ...query,
          title: { $regex: new RegExp(search, "i") },
        };
        blogs = await Blog.find(titleQuery)
          .skip(skip)
          .limit(Number(limit))
          .exec();
      }
    } else {
      blogs = await Blog.find(query).skip(skip).limit(Number(limit)).exec();
    }

    if (!blogs || blogs.length === 0) {
      return next(new ApiError(404, "No blogs found"));
    }

    // Count total records for pagination
    const totalRecords = await Blog.countDocuments(query);
    const pages = Math.ceil(totalRecords / limit);

    const pagination = {
      current: Number(page),
      limit: Number(limit),
      next: {
        page: Number(page) < pages ? Number(page) + 1 : null,
        limit: Number(limit),
      },
      pages: pages,
      records: totalRecords,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Blog list retrieved successfully",
          blogs,
          pagination
        )
      );
  } catch (error) {
    next(error);
  }
};

// Delete Blog
const handleDeleteBlog = async (req, res, next) => {
  try {
    const blogId = req.params.id;

    let blog = await Blog.findById(blogId);

    if (!blog) {
      return next(new ApiError(404, "Blog not found"));
    }

    blog.disabled = true;
    await blog.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "Blog delete successfully", blog));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateBlog,
  handleGetAllBlog,
  handleDeleteBlog,
  handleUpdateBlog,
};
