const jwt = require('jsonwebtoken');
const HttpError = require("../models/http-error");
require('dotenv').config();

const JWT_SECRET = process.env.SECRET_JWT_STRING;

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization.split(" ")[1];

        if (!token) {
            throw new Error("authentication failed!")
        }

        const decodedToken = jwt.verify(token, JWT_SECRET)
        req.userData = {userId: decodedToken.userId}
        next();
    } catch (err) {
        const error = new HttpError('Authentication failed!', 401);
        return next(error);
    }

}