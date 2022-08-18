const mongoose=require('mongoose')

const wallet= new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        unique: true
    },
    KYCdocType:{
        type:String,
        require:true
    },
    KYCdoc:{
        type: Object,
        require:true
    },
    KYCdocNumber:{
        type: String,
        require: true
    },
    mobile:{
        type: Number,
        required: true
    },
    amount:{
        type: Number,
        default:0,
        require:true
    },
    isActive:{
        type: Boolean,
        default: false
    },
    isAdminVerified:{
        type: Boolean,
        default: false
    },
    isRejected:{
        type:Boolean,
        default:false
    },
    rejectNote:{
        type:String,
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

module.exports=mongoose.model('wallet',wallet)