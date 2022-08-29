const mongoose=require('mongoose')

const booking= new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    car:{
        type: mongoose.Schema.Types.ObjectId,
        require:true
    },
    name:{
        type:String,
        require:true
    },
    mobile:{
        type:Number,
        require:true
    },
    pickUpDateTime:{
        type: Date,
        require:true
    },
    dropUpDateTime:{
        type: String,
        require:true
    },
    estimateKm:{
        type: String,
        require:true
    },
    estimatePrice:{
        type: Number,
        require: true
    }
})

module.exports=mongoose.model('booking',booking)