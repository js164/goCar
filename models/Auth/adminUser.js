const mongoose=require('mongoose')

const goCarAdminUser= new mongoose.Schema({
    username:{
        type: String,
    },
    password:{
        type:String,
    },
    createdAt:{
        type: Date,
        default:Date.now
    },
    isAdmin:{
        type:Boolean,
        default:true
    }
})

const User=mongoose.model('goCarAdminAUser',goCarAdminUser)
User.createIndexes()
module.exports=User