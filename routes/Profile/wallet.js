const express = require('express')
const route = express.Router()
const wallet = require('../../models/Booking/wallet')
const OTPModel = require('../../models/Booking/otp')
const walletHistory = require('../../models/Booking/walletHistory')
const { adminAuth, jwtauth } = require('../../AuthMiddlewere')
const multer = require('multer')
var otpGenerator = require('otp-generator');
const { hashSync, compareSync } = require('bcrypt')
const User = require('../../models/Auth/user')
const path = require('path');
const fs = require('fs');
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

    const otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

    console.log(otp)
    console.log("otp")


    const otpUSER = await OTPModel.findOne({ user: data.user });
    if (otpUSER) {
        OTPModel.findOneAndUpdate({ user: data.user }, { otp: hashSync(otp, 10) }).then(response => {
            console.log(response);
        }).catch(err => {
            console.log(err);
        })
    } else {
        //Create OTP instance in DB
        const otp_instance = await OTPModel.create({
            otp: hashSync(otp, 10),
            mobile: data.mobile,
            user: data.user
        });
    }

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


const addHistory=function (type,message,wallet,addedBy){
    const h = new walletHistory({
        type,message,wallet,addedBy
    });
    h.save().then(data => {
        console.log(data);
    }).catch(err => {
        console.log(err);
    })
}

route.get('/wallet', jwtauth, async function (req, res) {
    if (!res.headersSent) {
        let w = await wallet.findOne({ user: req.user }).lean();
        if (w) {
            const u = await User.findById(w.user);
            w['username'] = u.username;
            if (w.KYCdoc) {
                w.KYCdoc = fs.readFileSync(path.join(__dirname, '..', '..', '/docs/' + w.KYCdoc.filename), { encoding: 'base64' })
            }
            res.send(200, { WalletCreated: true, success: true, data: w })
        } else {
            res.send(200, { WalletCreated: false })
        }
    }
});

route.get('/walletRequest', jwtauth, async function (req, res) {
    if (!res.headersSent) {
        let w = await wallet.find({ isActive: true, isAdminVerified: false }).lean();
        if (w) {
            if (w.length > 0) {
                for (let i = 0; i < w.length; i++) {
                    w[i].KYCdoc = fs.readFileSync(path.join(__dirname, '..', '..', '/docs/' + w[i].KYCdoc.filename), { encoding: 'base64' })
                }
            }
            res.send(200, { success: true, data: w })
        } else {
            res.send(200, { success: false })
        }
    }
});

route.get('/wallet/otp/resend', jwtauth, async function (req, res) {
    if (!res.headersSent) {
        const w = await wallet.findOne({ user: req.user });
        if (w) {
            sendOTP(w);
            res.send(200, { success: true, message: "OTP sended successfully!" })
        } else {
            res.send(403, { message: "user is not registed for wallet!" })
        }
    }
});

route.post('/wallet/create', jwtauth, upload.single('KYCdoc'), function (req, res) {
    if (!res.headersSent) {
        const KYCdoc = req.file
        const user = req.user
        const username = req.user.username
        const { KYCdocNumber, mobile, KYCdocType } = req.body;
        const w = new wallet({
            KYCdoc, KYCdocNumber, user, mobile, KYCdocType, username
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
            wallet.findByIdAndUpdate(req.params.id, { isAdminVerified: true, isRejected: false, rejectNote: '' }).then(response => {
                addHistory("Success","Admin verified wallet",w,req.user)
                res.send(200, { success: true, data: response, message: "wallet successfully verified!" })
            }).catch(err => {
                console.log(err);
                res.send(500, { success: false, message: err.message })
            })
        }
    }
});

route.put('/wallet/reject/:id', jwtauth, adminAuth, async function (req, res) {
    if (!res.headersSent) {
        const w = await wallet.findById(req.params.id);
        if (w) {
            wallet.findByIdAndUpdate(req.params.id, { isAdminVerified: false, isRejected: true, rejectNote: req.body.message }).then(response => {
                res.send(200, { success: true, data: response, message: "wallet successfully rejected!" })
            }).catch(err => {
                console.log(err);
                res.send(500, { success: false, message: err.message })
            })
        }
    }
});


route.post('/wallet/otpverify', jwtauth, async function (req, res) {
    if (!res.headersSent) {
        const otp = await OTPModel.findOne({ user: req.user });
        if (otp) {
            if (compareSync(req.body.otp, otp.otp)) {
                wallet.findOneAndUpdate({ user: req.user }, { isActive: true }).then(response => {
                    console.log(response);
                    res.send(200, { success: true, data: response, message: "wallet successfully verified!" })
                }).catch(err => {
                    console.log(err);
                    res.send(500, { success: false, message: err.message })
                })
            } else {
                res.send(200, { success: false, message: "please enter valid otp!" })
            }
        } else {
            res.send(200, { success: false, message: "OTP has been expired!" })
        }
    }
})


route.get('/wallet/history/:id', jwtauth, async function (req, res) {
    if (!res.headersSent) {
        try {
            const w = await walletHistory.find().lean();
            if (w) {
                res.send(200, { success: true, data: w })
            } else {
                res.send(500, { success: false, messgae: "something wents wrong!" })
            }
        }
        catch (err) {
            console.log(err);
            res.send(500, { success: false, message: err.message })
        }
    }
});

module.exports = route;