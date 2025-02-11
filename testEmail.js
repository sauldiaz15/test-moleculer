const nodemailer = require("nodemailer");
require("dotenv").config();

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Prueba" <${process.env.SMTP_USER}>`,
      to: "tu-correo-de-prueba@gmail.com",
      subject: "Prueba de correo",
      text: "Este es un correo de prueba.",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado:", info.response);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
}

testEmail();
