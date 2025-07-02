import { generateVerificationCodeOtpEmailTemplate } from "./emailTemplates.js";
import { sendEmail } from "./sendEmail.js";

export async function sendVerificationCode(verificationCode, email, res){
    try{
        const message = generateVerificationCodeOtpEmailTemplate(verificationCode);
        sendEmail({
            email,
            subject: "Verification Code(Library Management System)",
            message,
        });
        res.status(200).json({
            success: true,
            message: "Verification code sent successfully."
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Verification code failed to sendVerificationCode.",
        })
    }
}