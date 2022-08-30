const mongoose=require('mongoose')

const cars= new mongoose.Schema({
    carId:{
        type: String,
        require: true,
        unique:true
    },
    name:{
        type: String,
        require:true
    },
    category:{
        type: String,
        require:true
    },
    carCompany:{
        type: String,
        require:true
    },
    colour:{
        type: String,
        require:true
    },
    registerNumber:{
        type: String,
        require:true
    },
    image:{
        type: Object,
    },
    isReady:{
        type: Boolean,
        default: true
    },
    isBooked:{
        type: Boolean,
        default: false
    },
    status:{
        type: String,
        default:"Active"
    },
    remarks:{
        type:String
    }
})

module.exports=mongoose.model('cars',cars)