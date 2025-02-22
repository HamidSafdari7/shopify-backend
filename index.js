const express = require('express')
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require("multer");
const path = require("path");
const port = process.env.PORT || 3000

const baseURL = "https://shopify-backend-plum.vercel.app/"

// middleware setup
app.use(express.json({ limit: "25mb" }));
// app.use((express.urlencoded({ limit: "25mb" })));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
//

app.use('/attachments', express.static(path.join(__dirname, 'public/attachments')));

// image upload 
const uploadImage = require("./src/utils/uploadImage")

// All Routes
const authRoutes = require('./src/users/user.route');
const productRoutes = require('./src/products/products.route');
const blogRoutes = require('./src/blogs/blogs.route');
const reviewRoutes = require('./src/reviews/reviews.route');
const orderRoutes = require('./src/orders/orders.route');
const statsRoutes = require('./src/stats/stats.route')


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/stats', statsRoutes)
//



main()
    .then(() => console.log("MongoDB is successfully connected"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.DB_URL);

    app.get('/', (req, res) => {
        res.send('HS7 Shopify server is running...')
    })
}


// upload image via multer

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/attachments");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

app.post("/uploadImage", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    const filePath = req.file.path.replace(/\\/g, '/'); // Replace backslashes with forward slashes
    res.send({ filePath: filePath.replace('public', baseURL) }); // Send the path without 'public'
});

//


// app.post("/uploadImage", (req, res) => {
//     uploadImage(req.body.image)
//         .then((url) => res.send(url))
//         .catch((err) => res.status(500).send(err));
// });


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})