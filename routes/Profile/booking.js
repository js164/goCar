const express = require('express')
const route = express.Router()
const booking = require('../../models/Booking/booking')
const cars = require('../../models/Cars/cars')
const { jwtauth, adminAuth } = require('../../AuthMiddlewere')

route.post('/create', jwtauth, async function (req, res) {
    if (!res.headersSent) {
        const selectedCar = await cars.findOne({ carId: req.body.car })
        req.body.car = selectedCar;
        const b = new booking({ ...req.body, user: req.user });
        b.save().then(data => {
            console.log(data);
            cars.findByIdAndUpdate(selectedCar._id, { isBooked: true, isReady: false });
            res.send(200, { success: true, data: data, message: "Booking successfully created!" })
        }).catch(err => {
            console.log(err); -
                res.send(500, { success: false, message: err.message })
        })
    }
});


route.get('/all', jwtauth, adminAuth, async function (req, res) {
    if (!res.headersSent) {
        try {
            const bookings = await booking.find().lean()
            if (bookings) {
                res.send(200, { success: true, data: bookings })
            }
        } catch (err) {
            console.log(err);
            res.send(500, { success: false, message: err.message })
        }
    }
})

module.exports = route;