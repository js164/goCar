const https = require('https');
const express = require('express')
const route = express.Router()
const { jwtauth } = require('../../AuthMiddlewere')
const transactions=require('../../models/Booking/transactions')
const wallet=require('../../models/Booking/wallet')
const uuid=require('uuid')
const PaytmChecksum = require('./PaytmChecksum');

/*
* import checksum generation utility
* You can get this utility from https://developer.paytm.com/docs/checksum/
*/

route.post('/initiate',jwtauth,async function(req,res){

    const w= await wallet.findOne({user:req.user});
    if(w){
        let orderId=uuid.v4()
        const txn= await transactions.create({
            txnType:"Initiate",
            user: req.user,
            wallet: w,
            amount:req.body.amount,
            orderId:orderId
        })

        
            var paytmParams = {};
        
            paytmParams= {
                "requestType": "Payment",
                "mid": process.env.MID,
                "WEBSITE": "goCar",
                "orderId": txn.orderId,
                "callbackUrl": "https://localhost:5000/paymet/callback",
                "TXN_AMOUNT":  txn.amount,
                "userInfo": {
                    "custId": txn.user,
                },
            };
            console.log(paytmParams)
            var paytmChecksum = await PaytmChecksum.generateSignature(JSON.stringify(paytmParams), process.env.MKEY);
            paytmParams= {
                ...paytmParams,
                "CHECKSUMHASH"    : paytmChecksum
            };
            res.send(200,{success:true,paytmParams:paytmParams})
    }


      
})

route.get('/callback',function(req,res){
    console.log(req.body)
})

module.exports = route;
