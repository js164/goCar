const express = require('express')
const route = express.Router()
const wallet = require('../../models/Booking/wallet')
const OTPModel = require('../../models/Booking/otp')
const { adminAuth, jwtauth } = require('../../AuthMiddlewere')
const multer = require('multer')
var otpGenerator = require('otp-generator');
const { hashSync , compareSync} = require('bcrypt')
// var AWS = require('aws-sdk');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './docs/')
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname)
    }
})
const upload = multer({ storage: storage })

async function sendOTP(data) {

    const otp = otpGenerator.generate(6, { alphabets: false, upperCase: false, specialChars: false });

    //Create OTP instance in DB
    const otp_instance = await OTPModel.create({
      otp: hashSync(otp, 10),
      mobile: data.mobile,
      user:data.user
    });
    console.log(otp_instance)


    // var params = {
    //     Message: req.query.message,
    //     PhoneNumber: '+' + req.query.number,
    //     MessageAttributes: {
    //         'AWS.SNS.SMS.SenderID': {
    //             'DataType': 'String',
    //             'StringValue': req.query.subject
    //         }
    //     }
    // };

    // var publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();

    // publishTextPromise.then(
    //     function (data) {
    //         res.end(JSON.stringify({ MessageID: data.MessageId }));
    //     }).catch(
    //         function (err) {
    //             res.end(JSON.stringify({ Error: err }));
    //         });

}



route.post('/wallet/create', jwtauth, upload.single('KYCdoc'), function (req, res) {
    if (!res.headersSent) {
        const KYCdoc = req.file
        const user = req.user
        const { KYCdocNumber, mobile, KYCdocType } = req.body;
        const w = new wallet({
            KYCdoc, KYCdocNumber, user, mobile, KYCdocType
        });
        w.save().then(data => {
            console.log(data);
            sendOTP(data)
            res.send(200, { success: true, data: data, message: "wallet successfully created!" })
        }).catch(err => {
            console.log(err);
            res.send(500, { success: false, message: err.message })
        })
    }
});


route.put('/wallet/update', jwtauth, upload.single('KYCdoc'), async function (req, res) {
    if (!res.headersSent) {
        const w = await wallet.findOne({ user: req.user });
        if (w) {
            const KYCdoc = req.file
            const user = req.user
            const isAdminVerified = false
            const { KYCdocNumber, mobile, KYCdocType } = req.body;
            let data = { KYCdocNumber, KYCdocType, mobile, user, isAdminVerified };
            if (KYCdoc) {
                data = { KYCdoc, KYCdocNumber, KYCdocType, mobile, user, isAdminVerified }
            }
            wallet.findOneAndUpdate({ user: req.user }, data).then(response => {
                console.log(response);
                res.send(200, { success: true, data: response, message: "wallet successfully updated!" })
            }).catch(err => {
                console.log(err);
                res.send(500, { success: false, message: err.message })
            })
        }
    }
});

route.put('/wallet/verify/:id', jwtauth, adminAuth, async function (req, res) {
    if (!res.headersSent) {
        const w = await wallet.findById(req.params.id);
        if (w) {
            wallet.findByIdAndUpdate(req.params.id, { isAdminVerified: true }).then(response => {
                console.log(response);
                res.send(200, { success: true, data: response, message: "wallet successfully verified!" })
            }).catch(err => {
                console.log(err);
                res.send(500, { success: false, message: err.message })
            })
        }
    }
});

sendOTP({mobile:"11111",otp:"1111"})

route.post('/wallet/otpverify',jwtauth, async function(req,res){
    if(!res.headersSent){
        const otp=await OTPModel.findOne({user:req.user});
        if(otp){

        }else{
            res.send(200,{success:false,message:"OTP has been expired!"})
        }
    }
})


module.exports = route;