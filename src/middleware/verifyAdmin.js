const verifyAdmin = (req, res, next) => {

    try {

        if (req.role !== "admin") {
            return res.status(403).send({ success: false, message: "Your not allowed to access this area" })
        }

        next();

    } catch (error) {

        console.log("Error in verifying admin", error);
        res.status(401).send({ message: "Error in verifying admin" })
    }
}

module.exports = verifyAdmin;