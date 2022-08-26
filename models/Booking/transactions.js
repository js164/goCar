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
    orderId:{
        type: String,
        require: true,
        unique: true
    },
    transactionsId:{
        type: String
    },
    refrenceId:{
        type: String
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