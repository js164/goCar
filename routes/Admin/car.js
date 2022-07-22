const express = require('express')
const route = express.Router()
const cars = require('../../models/Cars/cars')
const { adminAuth, jwtauth } = require('../../AuthMiddlewere')
const multer = require('multer')
const path = require('path');
const fs = require('fs');


const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './images/')
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname)
    }
})
const upload = multer({ storage: storage })

route.get('/all', jwtauth, async function (req, res, next) {
    if (!res.headersSent) {
        try {
            let allcars = await cars.find().lean();
            for(let i=0;i<allcars.length;i++){
                if(allcars[i].image){
                    allcars[i].image=fs.readFileSync(path.join(__dirname,'..','..', '/images/' + allcars[i].image.filename),{encoding: 'base64'})
                }
            }
            res.send(200, { success: true, data: allcars })
        }
        catch (err) {
            console.log(err);
            res.send(500, { success: false, message: err.message })
        }
    }

});

route.get('/id/:id', jwtauth, async function (req, res, next) {
    if (!res.headersSent) {
        try {
            var car = await cars.findOne({carId:req.params.id});
            console.log(car)
            if(car && car.image){
                car.image=fs.readFileSync(path.join(__dirname,'..','..', '/images/' + car.image.filename),{encoding: 'base64'})
            }
            res.send(200, { success: true, data: car })
        }
        catch (err) {
            console.log(err);
            res.send(500, { success: false, message: err.message })
        }
    }

});

route.post('/addCar', jwtauth, adminAuth,upload.single('image'),async function (req, res, next) {
    if (!res.headersSent) {
        const { name, category, carCompany, colour, registerNumber} = req.body;
        const image = req.file
        const carId=new Date().toISOString().replaceAll(/[-.:TZ]/g, '') + Math.random().toString().substring(2,7);
        const car = new cars({
            name, category, carCompany, colour, registerNumber, image , carId
        });
        car.save().then(data => {
            console.log(data);
            res.send(200, { success: true, data: data , message:"car successfully added!" })
        }).catch(err => {
            console.log(err);
            res.send(500, { success: false, message: err.message })
        })
    }

});

route.delete('/remove/:id', jwtauth, adminAuth,async function (req, res, next) {
    if (!res.headersSent) {
        const car = await cars.findById(req.params.id);
        if(car){
            await cars.findByIdAndDelete(req.params.id);
            res.send(200,{success:true, message:"car successfully deleted!"})
        }else{
            res.send(400, { success: false, message: "Bad Request!" })
        }
    }

});


route.put('/update/:id', jwtauth, adminAuth,upload.single('image'),async function (req, res, next) {
    if (!res.headersSent) {
        const car = await cars.findById(req.params.id);
        if(car){
            const image = req.file
            const { name, category, carCompany, colour, registerNumber } = req.body;
            let data={name, category, carCompany, colour, registerNumber};
            if(image){
                data={name, category, carCompany, colour, registerNumber, image}
            }
            const updatedcar=await cars.findByIdAndUpdate(req.params.id,data)
            res.send(200,{success:true, message:"car successfully updated!",data:updatedcar})
        }else{
            res.send(400, { success: false, message: "Bad Request!" })
        }
    }

});

module.exports = route;