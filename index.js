const express=require('express')
const app=express()
const passport=require('passport')
require('./passport.js')(passport)
const dotenv=require('dotenv').config()
const mongoose=require('mongoose')
const session=require('express-session')
const MongoStore=require('connect-mongo')
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000'
}));


app.use(express.urlencoded({extended:false}))
app.use(express.json())

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store:MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    })
  }))

app.use(passport.initialize())
app.use(passport.session())

app.use('/auth',require('./routes/Auth/auth'))
app.use('/adminAuth',require('./routes/Auth/adminAuth'))
app.use('/car',require('./routes/Admin/car'))
app.use('/category',require('./routes/Admin/rate'))
app.use('/profile',require('./routes/Profile/wallet'))
app.use('/payment',require('./routes/Payment/paytm'))
app.use('/booking',require('./routes/Profile/booking'))

port=process.env.PORT || 5000
const connectDB=require('./db')
connectDB()


app.listen(port,
    console.log(`server started on port ${port}`)
)
