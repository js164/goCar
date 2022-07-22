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
    pickUpDate:{
        type: Date,
        require:true
    },
    pickUpTime:{
        type: String,
        require:true
    },
    perHourOrKm:{
        type: String,
        require:true
    }
})

module.exports=mongoose.model('booking',booking)