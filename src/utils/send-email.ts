import nodemailer from 'nodemailer';
import { envConfig } from '../config/env.config';

const sendEmail = (
  receivers: string,
  content: string,
  subject?: string,
  text?: string,
) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: envConfig.EMAIL_USERNAME, // generated ethereal user
      pass: envConfig.EMAIL_PASSWORD, // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // setup email data with unicode symbols
  const mailOptions = {
    from: envConfig.EMAIL_USERNAME, // sender address
    to: receivers, // list of receivers
    subject: subject, // Subject line
    text: text, // plain text body
    html: content, // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, _) => {
    if (error) {
      console.log(error);
      return false;
    }

    return true;
  });
};

export default sendEmail;
