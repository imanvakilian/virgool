export enum authMessage {
    conflict = "user already exists",
    notFound = "user not found",
    invalidType = "invalid auth type",
    invalidUsername = "invalid information",
    otpSent = "otp sent successfully",
    expiredCode = "code has expired or invalid",
    tryAgain = "please try again",
    loginAgain = "login again",
    badTiming = "please try again after 2 minutes",
    loggeIn = "you logged in successfully",
}