import { productClient } from "../lib/helpers/Dynamo/user.helper.js";
import { USER_TABLE_NAME } from "../lib/config/db.config.js";
import {
    GetItemCommand
} from "@aws-sdk/client-dynamodb"
import {
    TwilioAccountSid,
    TwilioAuthToken,
    OTP_MAX_VALUE, OTP_MIN_VALUE,
    ADMIN_MOBILE_NUMBER,
    TWILIO_MOBILE_NUMBER,
    OTP_EXPIRATION_TIME
}
    from "../lib/config/user.config.js";
import twilio from 'twilio';



const client = twilio(TwilioAccountSid, TwilioAuthToken);



export const verifyAdminLogin = async (req, res, next) => {
    try {
        const { phone, password: userPassword } = req.body;
        console.log(phone, userPassword)
        const command = new GetItemCommand({
            TableName: USER_TABLE_NAME,
            Key: {
                phone: { N: Number(phone).toString() }
            }
        });

        const user = await productClient.send(command)

        if (user.Item === undefined) {
            return res.status(404).json({
                status: "fail",
                message: "User Phone does not match"
            });
        }
        const {
            Item: {
                password:
                {
                    S: password
                },
                name:
                {
                    S: name
                },
                role:
                {
                    S: role
                }
            }
        } = user

        if (role === "admin" && password !== userPassword) {

            return res.status(404).json({
                status: "fail",
                message: "user password does not match"
            });
        }
        if (role == "admin" && password == userPassword) {
            return res.status(200).cookie("status", "ok").json({
                status: "success",
                data: {
                    password,
                    name,
                    role,
                }
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "fail",
            message: "Cannot verify"
        });
    }
}


export const sendOTP = async (req, res, next) => {
    try {
        const otp = Math.floor(Math.random() * parseInt(OTP_MAX_VALUE)) + parseInt(OTP_MIN_VALUE);
        console.log(otp);

        const message = await client.messages.create({
            body: `YOUR ACCOUNT RECOVERY OTP FROM SRI VINAYAGA AUTOMOBILES ${otp}`,
            to: ADMIN_MOBILE_NUMBER, // Text your number
            from: TWILIO_MOBILE_NUMBER, // From a valid Twilio number
        });

        return res.status(201).cookie("OTP", otp).json({
            status: "success",
            message: 'OTP sent successfully!'
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ success: "fail", message: 'Failed to send OTP.' });
    }
}


export const verifyOTP = (req, res, next) => {
    const { userOTP } = req.body
    console.log("dsvbf")
    console.log(userOTP)
    const { headers: { cookie } } = req
    console.log(cookie)
    const OTP = cookie
        .split(';').find((val) => val.trim().startsWith("OTP="))?.split('=')[1].trim()
    console.log("sadg")
    console.log(OTP)
    if (parseInt(OTP) === parseInt(userOTP)) {
        res.status(200).json(
            {
                status: "success",
                message: 'OTP Verification Successfull'
            }
        )
    } else {
        res.status(401).json(
            {
                status: "fail",
                message: 'OTP Verification Unsuccessfull'
            }
        )
    }
}