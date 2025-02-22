const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    image: String,
    author: { type: mongoose.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });


const Blogs = mongoose.model("Blog", BlogSchema);
module.exports = Blogs;