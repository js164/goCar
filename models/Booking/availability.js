const mongoose=require('mongoose')

const availiblity= new mongoose.Schema({
    car:{
        type: mongoose.Schema.Types.ObjectId,
        require:true
    },
    bookingId:{
        type:mongoose.Schema.Types.ObjectId,
        require:true
    },
    date:{
        type: Date,
        require:true
    }
})

module.exports=mongoose.model('availiblity',availiblity)