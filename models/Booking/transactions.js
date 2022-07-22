const mongoose=require('mongoose')

const transactions= new mongoose.Schema({
    wallet:{
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    transactionsId:{
        type: String,
        require:true
    },
    refrenceId:{
        type: String,
        require: true
    },
    amount:{
        type: Number,
        require:true
    },
    txnType:{
        type: String,
        required : true,
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports=mongoose.model('transactions',transactions)