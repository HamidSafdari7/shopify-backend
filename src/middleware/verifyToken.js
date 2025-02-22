const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET_KEY;


const verifyToken = (req, res, next) => {

    try {

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).send({ message: "Please login first" })
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (!decoded) {
            return res.status(401).send({ message: "Unable to find the token" })
        }

        req.userId = decoded.userId;
        req.role = decoded.role;
        next();

    } catch (error) {

        console.log("Error in verifying token", error);
        res.status(401).send({ message: "Error in verifying token" })
    }
}

module.exports = verifyToken;