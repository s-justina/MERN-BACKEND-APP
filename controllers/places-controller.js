const {validationResult} = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place')

let DUMMY_PLACES = [{
    id: 'p1',
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    location: {
        lat: 40.7484474,
        lng: -73.9871516
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: 'u1'
}];

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find a place.', 500);
        return next(error);
    }


    if (!place) {
        const error = new HttpError("Could not find a place for the provided id.", 404);
        return next(error);
    }

    res.json({place: place.toObject({getters: true})});
}

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let places;

    try {
        places = await Place.find({creator: userId});
    } catch (err) {
        const error = new HttpError('Fetching places failed, please try again later.', 500);
        return next(error);
    }

    if (!places || places.length === 0) {
        return next(new HttpError("Could not find places for the provided user id.", 404));
    }

    res.json({places: places.map(place => place.toObject({getters: true}))});
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const {title, description, address, creator} = req.body;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }


    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: "https://travel.usnews.com/dims4/USNEWS/4aee1bb/2147483647/resize/976x652%5E%3E/crop/976x652/quality/85/?url=https%3A%2F%2Ftravel.usnews.com%2Fimages%2FEmpire_State_Building_Getty_Zsolt_Hlinka.jpg",
        creator
    })

    try {
        await createdPlace.save();
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again.', 500);

        return next(error);
    }

    res.status(201).json({place: createdPlace});
}

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new HttpError('Invalid inputs passed, please check your data.', 422);
        return next(error);
    }

    const {title, description} = req.body;
    const placeId = req.params.pid;
    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update a place.', 500);
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update a place.', 500);
        return next(error);
    }

    res.status(200).json({place: place.toObject({getters: true})});

}
const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;

    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete place.', 500);
        return next(error);
    }

    try {
        await place.deleteOne();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete place.', 500);
        return next(error);
    }

    res.status(200).json({message: "Deleted place."})
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;