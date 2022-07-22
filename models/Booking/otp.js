const mongoose=require('mongoose')

const OTPModel= new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    mobile:{
        type: String,
        require:true
    },
    otp:{
        type: String,
        require:true
    },
    createdAt:{
        type: Date,
        default:Date.now
    }
})

OTPModel.index({ expireAfterSeconds: 20 });

module.exports=mongoose.model('OTPModel',OTPModel)