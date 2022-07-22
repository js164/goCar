const mongoose=require('mongoose')

const rates= new mongoose.Schema({
    category:{
        type: String,
        require:true
    },
    pricePerKm:{
        type: Number,
        require:true
    },
    pricePerHour:{
        type: String,
        require:true
    }
})


const Rates=mongoose.model('rates',rates)
Rates.createIndexes()
module.exports=Rates