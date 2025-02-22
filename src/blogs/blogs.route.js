const express = require('express');
const Blogs = require('./blogs.model');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const router = express.Router();

// create a blog
router.post('/create-blog', verifyToken, verifyAdmin, async (req, res) => {
    try {

        const newBlog = new Blogs({ ...req.body });
        const savedBlog = await newBlog.save();
        res.status(200).send({ message: "New blog created successfully", savedBlog });

    } catch (error) {
        console.error("An Error occured in creating blog section", error);
        res.status(500).send({ message: "An Error occured in creating blog section" })
    }
});
//

// all blogs
router.get('/', async (req, res) => {
    try {

        const { page = 1, limit = 10 } = req.query;

        let filter = {};

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const totalBlogs = await Blogs.countDocuments(filter);
        const totalPages = Math.ceil(totalBlogs / parseInt(limit));
        const blogs = await Blogs.find(filter).skip(skip).limit(parseInt(limit)).populate("author", "email").sort({ createdAt: -1 });

        res.status(200).send({ blogs, totalPages, totalBlogs });

    } catch (error) {
        console.error("An Error occured in fetching all blogs", error);
        res.status(500).send({ message: "An Error occured in fetching all blogs" })
    }
})
//


//get latest blogs
router.get('/latest-blogs', async (req, res) => {
    try {

        const { limit = 4 } = req.query;
        const totalBlogs = await Blogs.countDocuments();
        const blogs = await Blogs.find({}).limit(parseInt(limit)).populate("author", "email").sort({ createdAt: -1 });

        res.status(200).send({ blogs, totalBlogs });

    } catch (error) {
        console.error("An Error occured in fetching latest blogs", error);
        res.status(500).send({ message: "An Error occured in fetching latest blogs" })
    }
})
//

//get all blogs without filtering
router.get('/all-blogs', async (req, res) => {
    try {

        const blogs = await Blogs.find({}).populate("author", "email").sort({ createdAt: -1 });

        res.status(200).send({ blogs });

    } catch (error) {
        console.error("An Error occured in fetching all blogs", error);
        res.status(500).send({ message: "An Error occured in fetching all blogs" })
    }
})
//

// get single blog
router.get('/:id', async (req, res) => {
    try {

        const blogId = req.params.id;
        const blog = await Blogs.findById(blogId).populate("author", "email username");
        if (!blog) {
            res.status(404).send({ message: "Blog not found" })
        }

        res.status(200).send({ blog })

    } catch (error) {
        console.error("An Error occured in getting single blog section", error);
        res.status(500).send({ message: "An Error occured in getting single blog section" })
    }
})
//

// update a blog
router.patch('/update-blog/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {

        const blogId = req.params.id;
        const updatedBlog = await Blogs.findByIdAndUpdate(blogId, { ...req.body }, { new: true });

        if (!updatedBlog) {
            return res.status(404).send({ message: "Blog not found" });
        }

        res.status(200).send({ message: "Blog updated successfully", blog: updatedBlog })

    } catch (error) {
        console.error("An Error occured in updating blog section", error);
        res.status(500).send({ message: "An Error occured in updating blog section" })
    }
})
//

// delete a blog
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {

        const blogId = req.params.id;
        const deletedBlog = await Blogs.findByIdAndDelete(blogId);

        if (!deletedBlog) {
            return res.status(404).send({ message: "Blog not found" });
        }

        res.status(200).send({ message: "Blog deleted successfully" })

    } catch (error) {
        console.error("An Error occured in deleting blog section", error);
        res.status(500).send({ message: "An Error occured in deleting blog section" })
    }
})
//


module.exports = router;