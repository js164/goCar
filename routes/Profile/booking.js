const express = require('express')
const route = express.Router()
const booking = require('../../models/Booking/booking')
const availiblity= require('../../models/Booking/availability')
const cars = require('../../models/Cars/cars')
const { jwtauth, adminAuth } = require('../../AuthMiddlewere')
const path = require('path');
const fs = require('fs');
const generateUniqueId = require('generate-unique-id');

route.get('/car/availiblity/:id',async function(req,res){
    if (!res.headersSent) {
        try{
            const a= await availiblity.find({car:req.params.id})
            res.send(200, { success: true, data: a })
        }catch(err){
            console.log(err)
            res.send(500, { success: false, message: "Bad Request!" })
        }
    }
})

route.get('/car/byDateRange/:id/:sdate/:edate',async function(req,res){
    if (!res.headersSent) {
        try{
            let sdate=new Date(req.params.sdate)
            let edate=new Date(req.params.edate)
            const a= await availiblity.find({car:req.params.id})
            if(a){
                for(let i=0;i<a.length;i++){
                    if(a[i].date >=sdate && a[i].date <= edate){
                        res.send(200, { success: true, available: false })
                        return
                    }
                }
                res.send(200, { success: true, available: true })
            }
            else{
                res.send(200, { success: true, available: true })
            }
        }catch(err){
            console.log(err)
            res.send(500, { success: false, message: "Bad Request!" })
        }
    }
})


route.post('/create', jwtauth, async function (req, res) {
    if (!res.headersSent) {
        const selectedCar = await cars.findOne({ carId: req.body.car })
        req.body.car = selectedCar;
        const bookingId = generateUniqueId({
            length: 6
          });
        const b = new booking({ ...req.body, user: req.user, bookingId });
        b.save().then(data => {
            console.log(data);
            let sdate=new Date(b.pickUpDateTime.setHours(0,0,0,0))
            let edate=new Date(b.dropUpDateTime.setHours(23,59,59,59))
            while(sdate<=edate){
                const a= new availiblity({car:selectedCar._id,bookingId:b._id,date:sdate})
                a.save()
                sdate= new Date(sdate.getTime() + (1000*60*60*24))
            }
            cars.findByIdAndUpdate(selectedCar._id, { isBooked: true, isReady: false });
            res.send(200, { success: true, data: data, message: "Booking successfully created!" })
        }).catch(err => {
            console.log(err);
                res.send(500, { success: false, message: err.message })
        })
    }
});

route.put('/update/:id', jwtauth, async function (req, res) {
    if (!res.headersSent) {
        try{
            const b = await booking.findById(req.params.id)
            if(b){
                const updated_booking= await booking.findByIdAndUpdate(req.params.id,req.body,{new:true})
                res.send(200, { success: true, data: updated_booking, message: "Booking successfully updated!" })
            }
        }
        catch(err) {
            console.log(err);
            res.send(500, { success: false, message: err.message })
        }
    }
});


route.get('/all', jwtauth, adminAuth, async function (req, res) {
    if (!res.headersSent) {
        try {
            const bookings = await booking.find().lean().sort('pickUpDateTime')
            if (bookings) {
                for(let i=0; i<bookings.length;i++){
                    bookings[i]['carData']=await cars.findById(bookings[i].car);
                    if(bookings[i]['carData'] && bookings[i]['carData'].image){
                        bookings[i]['carData'].image=fs.readFileSync(path.join(__dirname,'..','..', '/images/' + bookings[i]['carData'].image.filename),{encoding: 'base64'})
                    }
                }
                res.send(200, { success: true, data: bookings })
            }
        } catch (err) {
            console.log(err);
            res.send(500, { success: false, message: err.message })
        }
    }
})

route.get('/active', jwtauth, adminAuth, async function (req, res) {
    if (!res.headersSent) {
        try {
            const bookings = await booking.find({status:'Active',pickUpDateTime:{$gte: (new Date).setHours(0,0,0,0)}}).lean().sort('pickUpDateTime')
            if (bookings) {
                for(let i=0; i<bookings.length;i++){
                    bookings[i]['carData']=await cars.findById(bookings[i].car);
                    if(bookings[i]['carData'] && bookings[i]['carData'].image){
                        bookings[i]['carData'].image=fs.readFileSync(path.join(__dirname,'..','..', '/images/' + bookings[i]['carData'].image.filename),{encoding: 'base64'})
                    }
                }
                res.send(200, { success: true, data: bookings })
            }
        } catch (err) {
            console.log(err);
            res.send(500, { success: false, message: err.message })
        }
    }
})

route.get('/myBookings', jwtauth, async function (req, res) {
    if (!res.headersSent) {
        try {
            const bookings = await booking.find({user:req.user}).lean().sort('pickUpDateTime')
            if (bookings) {
                for(let i=0; i<bookings.length;i++){
                    bookings[i]['carData']=await cars.findById(bookings[i].car);
                    if(bookings[i]['carData'] && bookings[i]['carData'].image){
                        bookings[i]['carData'].image=fs.readFileSync(path.join(__dirname,'..','..', '/images/' + bookings[i]['carData'].image.filename),{encoding: 'base64'})
                    }
                }
                res.send(200, { success: true, data: bookings })
            }
        } catch (err) {
            console.log(err);
            res.send(500, { success: false, message: err.message })
        }
    }
})

route.put('/cancel', jwtauth, adminAuth, async function (req, res) {
    if (!res.headersSent) {
        try {
            const activeBooking = await booking.findById(req.body.id).lean()
            if (activeBooking) {
                const cancelBooking = await booking.findByIdAndUpdate(req.body.id,{status:"Canceled",remarks:req.body.remark},{new:true})
                cars.findByIdAndUpdate(activeBooking.car, { isBooked: false, isReady: true });
                res.send(200, { success: true, data: cancelBooking ,message:"Booking successfully canceled."})
            }
        } catch (err) {
            console.log(err);
            res.send(500, { success: false, message: err.message })
        }
    }
})

module.exports = route;