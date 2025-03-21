const jwt = require('jsonwebtoken');
const User = require('../models/User');

function parseCookie(cookieString) {
    const cookieObj = {};
    const cookiePairs = cookieString.split("; ");

    for (const pair of cookiePairs) {
        const [key, value] = pair.split("=");
        cookieObj[key] = decodeURIComponent(value);
    }

    return cookieObj;
}

const verifyToken = async (req, res, next) => {
    const cookies = req.headers.cookie;

    if (!cookies) {
        console.log('token verify-no cookies');

        return res.status(401).send("Unauthorized");
    }
    const cookieObj = parseCookie(cookies);

    const token = cookieObj.token;

    if (!token) {
        console.log('token verify-no token');
        return res.status(401).send("Unauthorized");
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error("Error verifying token:", err);
        console.log('token verify-error decoding token');
        return res.status(401).send("Unauthorized");
    }

    const userId = decodedToken.userId;
    console.log(decodedToken);


    try {
        const user = await User.findById(userId);
        if (!user) {
            console.log('token verify-user not found');
            return res.status(401).send("Unauthorized");
        }
        req.user = user; // This line should set req.user
        next();
    } catch (err) {
        console.error("Error fetching user:", err);
        return res.status(500).send("Internal Server Error");
    }
};

module.exports = verifyToken;
