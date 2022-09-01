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
    bookingId:{
        type:String,
        require:true
    },
    book_for:{
        type:String,
        default:'Me',
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
        type: Date,
        require:true
    },
    estimateKm:{
        type: String,
        require:true
    },
    estimatePrice:{
        type: Number,
        require: true
    },
    status:{
        type: String,
        default:"Active"
    },
    remarks:{
        type:String
    }
})

module.exports=mongoose.model('booking',booking)