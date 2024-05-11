import dotenv from "dotenv";

dotenv.config({ path: '.env' })

export const TwilioAccountSid = process.env.TwilioAccountSid
export const TwilioAuthToken = process.env.TwilioAuthToken
export const OTP_MIN_VALUE = process.env.OTP_MIN_VALUE
export const OTP_MAX_VALUE = process.env.OTP_MAX_VALUE
export const ADMIN_MOBILE_NUMBER = process.env.ADMIN_MOBILE_NUMBER
export const TWILIO_MOBILE_NUMBER = process.env.TWILIO_MOBILE_NUMBER
export const OTP_EXPIRATION_TIME = process.env.OTP_EXPIRATION_TIME