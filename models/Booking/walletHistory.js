const mongoose=require('mongoose')

const walletHistory= new mongoose.Schema({
    wallet:{
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    addedBy:{
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    type:{
        type: String,
        require: true
    },
    message:{
        type: String,
        require:true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports=mongoose.model('walletHistory',walletHistory)