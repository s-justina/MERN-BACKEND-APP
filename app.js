const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const MONGO_DB_PASSWORD = process.env.MONGO_DB_PASSWORD;

const app = express();

app.use(bodyParser.json());

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    throw (new HttpError("Could not find this route.", 404))
})

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }

    res.status(error.code || 500);
    res.json({message: error.message || "An unknown error occurred."})
})

mongoose.connect(`mongodb+srv://justyna-mern:${MONGO_DB_PASSWORD}@cluster0.cl484fi.mongodb.net/?retryWrites=true&w=majority`)
    .then(
        () => app.listen(5000)
    )
    .catch(
        err => console.log(err)
    );
;