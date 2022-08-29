import {createTransport} from 'nodemailer';
import {google} from 'googleapis';

const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
oauth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN});

export const sendEmail = async (req, res) => {
    try {
        const { to, subject, text, html } = req.body;

        if(!to || !subject || !text){
            return res.status(400).json({
                message: 'Missing required fields'
            });
        }

        const acessToken = await oauth2Client.getAccessToken();

        let transporter = createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'sgedu@suportegerencial.com.br',
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                acessToken: acessToken,
            }
        });

        await transporter.sendMail({
            from: 'SGEDU-SUPORTEGERENCIAL 👻" <sgedu@suportegerencial.com.br>',
            to,
            subject,
            text,
            html
        });

        return res.status(200).json({
            message: 'Email sent'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error sending email',
            error
        });
    }
}