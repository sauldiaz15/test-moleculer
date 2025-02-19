const { Service } = require("moleculer");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  name: "password",
   
  methods: {
    async sendRecoveryEmail(email, resetToken, recoveryLink) {
      try {
        if (!email || !resetToken || !recoveryLink) 
          throw new Error("Email y token son obligatorios.");

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
          from: `"Soporte" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Recuperación de contraseña",
          html: `
            <p>Has solicitado restablecer tu contraseña.</p>
            <p>Puedes restablecerla desde la aplicación o la web:</p>
            <a href="${recoveryLink}">Abrir en la aplicación</a>
                
            <p>El enlace es válido por 15 minutos.</p>
            <p>Si no solicitaste este cambio, ignora este mensaje.</p>
          `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`✅ Correo enviado correctamente a ${email}`);
      } catch (error) {
        console.error("❌ Error enviando correo:", error);
        throw new Error("No se pudo enviar el correo de recuperación.");
      }
    },
  },//Fin de los metodos 

  actions: {
    async forgetPassword(ctx) {
        try {
          const { email, source } = ctx.params; //Destructuramos
          //Buscamos el usuario 
          const user = await ctx.call("user.findByEmail", { email });
          if (!user) throw new Error("Usuario no encontrado.");
      
          // 🔑 Generando token de recuperación...
          const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });
      
          // Determinar la URL de recuperación según el origen
          let recoveryLink;
          if (source === "app") {
            recoveryLink = `myapp://ResetPassword?token=${resetToken}`;
          } else if (source === "web") {
            recoveryLink = `http://localhost:8081/ResetPassword?token=${resetToken}`;
          } else {
            throw new Error("Origen de la solicitud no válido. Debe ser 'web' o 'app'.");
          }
      
          // Llamar a la methods para enviar el correo
          await this.sendRecoveryEmail(email, resetToken, recoveryLink);
    
          // Retornar el enlace según la fuente
          return { 
            email,
            message: "Correo de recuperación enviado.", 
            link: recoveryLink // Solo retorna el enlace correspondiente a la fuente
          };
        } catch (error) {
          throw new Error("Error al enviar el correo: " + error.message);
        }
      },// fin de forgetPassword

    async resetPassword(ctx) {
      try {
        const { token, newPassword } = ctx.params;
        if (!token || !newPassword) throw new Error("Token y nueva contraseña son obligatorios.");

        // 🔑 Verificando token...
        let decoded;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
          throw new Error("Token inválido o expirado.");
        }

        const email = decoded.email;

        // 🔍 Buscando usuario en la base de datos...
        const user = await ctx.call("user.findByEmail", { email });
        if (!user) throw new Error("Usuario no encontrado.");

        // 🔒 Validando contraseña...
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
          throw new Error("La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.");
        }

        // 🔐 Hasheando nueva contraseña...
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 📌 Actualizando contraseña en la base de datos...
        try {
          await ctx.call("user.updatePassword", { email, password: hashedPassword });
        } catch (error) {
          throw new Error(`No se pudo actualizar la contraseña: ${error.message}`);
        }

        return { message: "Contraseña actualizada correctamente." };
      } catch (error) {
        throw new Error(error.message);
      }
    },// fin de resetPassword
  }, //fin de accions
}; //fin del servicio 
