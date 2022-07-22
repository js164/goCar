const express = require('express')
const route = express.Router()
const rates = require('../../models/Calculation/rate')
const cars= require('../../models/Cars/cars')
const { adminAuth, jwtauth } = require('../../AuthMiddlewere')


route.get('/all', jwtauth, async function (req, res) {
    if (!res.headersSent) {
        try {
            const allrates = await rates.find().lean().sort('category');
            res.send(200, { success: true, data: allrates })
        }
        catch (err) {
            console.log(err);
            res.send(500, { success: false, message: err.message })
        }
    }

});

route.get('/car/:id', jwtauth, async function (req, res) {
    if (!res.headersSent) {
        try {
            console.log(req.params.id)
            var car = await cars.findOne({carId:req.params.id});
            console.log(car)
            const rate = await rates.findOne({category:car.category}).lean();
            res.send(200, { success: true, data: rate })
        }
        catch (err) {
            console.log(err);
            res.send(500, { success: false, message: err.message })
        }
    }

});


route.post('/add', jwtauth, adminAuth, function (req, res) {
    if (!res.headersSent) {
        const { category, pricePerKm, pricePerHour } = req.body;
        const rate = new rates({
            category, pricePerKm, pricePerHour
        });
        rate.save().then(data => {
            console.log(data);
            res.send(200, { success: true, data: data })
        }).catch(err => {
            console.log(err);
            res.send(500, { success: false, message: err.message })
        })
    }

});

route.delete('/remove/:id', jwtauth, adminAuth,async function (req, res) {
    if (!res.headersSent) {
        const rate = await rates.findById(req.params.id);
        if(rate){
            // let c=await cars.find();
            // c=c.filter(_=> _.categoty === rate.categoty);
            // c.map(_=>{
            //     _.delete()
            // })
            await rates.findByIdAndDelete(req.params.id);
            res.send(200,{success:true, message:"Category Successfully deleted!"})
        }else{
            res.send(400, { success: false, message: "Bad Request!" })
        }
    }

});


route.put('/update/:id', jwtauth, adminAuth,async function (req, res) {
    if (!res.headersSent) {
        const car = await rates.findById(req.params.id);
        if(rates){
            const { category, pricePerKm, pricePerHour } = req.body;
            const updatedrate=await rates.findByIdAndUpdate(req.params.id,{category, pricePerKm, pricePerHour},{new: true})
            res.send(200,{success:true, message:"Category successfully updated!",data:updatedrate})
        }else{
            res.send(400, { success: false, message: "Bad Request!" })
        }
    }

});

module.exports = route;