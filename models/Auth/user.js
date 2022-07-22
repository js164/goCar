const mongoose=require('mongoose')

const goCarUser= new mongoose.Schema({
    googleID:{
        type: String,
        default:JSON.stringify(Date.now),
    },
    displayName:{
        type: String,
    },
    username:{
        type: String,
    },
    password:{
        type:String,
    },
    image:{
        type: String,
    },
    createdAt:{
        type: Date,
        default:Date.now
    },
})

const User=mongoose.model('goCarUser',goCarUser)
User.createIndexes()
module.exports=User