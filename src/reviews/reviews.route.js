const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const Reviews = require('./reviews.model');
const Products = require('../products/products.model');
const router = express.Router();

// create a review
router.post('/post-review', verifyToken, async (req, res) => {
    try {

        const { comment, rating, productId, userId } = req.body;

        if (!comment) {
            res.status(400).send({ message: "Please fill the comment section" })
        } else if (!rating) {
            res.status(400).send({ message: "Please provide rating" })
        } else if (!productId || !userId) {
            res.status(400).send({ message: "User or product could not be found" })
        } else {

            const existingReview = await Reviews.findOne({ productId, userId });

            if (existingReview) {
                existingReview.comment = comment;
                existingReview.rating = rating;
                await existingReview.save();
            } else {
                const newReview = new Reviews({ comment, rating, productId, userId })
                await newReview.save();
            }

            const reviews = await Reviews.find({ productId });
            if (reviews.length > 0) {
                const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
                const averageRating = totalRating / reviews.length;
                const product = await Products.findById(productId);

                if (product) {
                    product.rating = averageRating;
                    await product.save({ validateBeforeSave: false });
                } else {
                    return res.status(404).send({ message: "Product nt found" })
                }
            }

            res.status(200).send({ message: "New review added successfully", reviews: reviews })
        }


    } catch (error) {
        console.error("An Error occured in posting review", error);
        res.status(500).send({ message: "An Error occured in posting review" })
    }
})
//

// get total reviews
router.get('/total-reviews', async (req, res) => {
    try {

        const totalReviews = await Reviews.countDocuments({});
        res.status(200).send({ totalReviews });

    } catch (error) {
        console.error("An Error occured in fetching all reviews", error);
        res.status(500).send({ message: "An Error occured in fetching all reviews" })
    }
})
//

//get review by userId
router.get('/:userId', async (req, res) => {

    const { userId } = req.params;
    if (!userId) {
        res.status(400).send({ message: "UserId not given" })
    }

    try {

        const reviews = await Reviews.find({ userId: userId }).sort({ createdAt: -1 });
        if (reviews.length === 0) {
            res.status(404).send({ message: "No review found" })
        }

        res.status(200).send(reviews);

    } catch (error) {
        console.error("An Error occured in fetching reviews base on userId", error);
        res.status(500).send({ message: "An Error occured in fetching reviews base on userId" })
    }
})
//

module.exports = router;