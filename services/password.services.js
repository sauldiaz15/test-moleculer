const { Service } = require("moleculer");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  name: "password",

  methods: {
    async sendRecoveryEmail(email, resetToken) {
      try {
        if (!email || !resetToken) throw new Error("Email y token son obligatorios.");

        // 🌐 Enlace Web
        const webResetLink = `https://localhost:3000/ResetPassword?token=${resetToken}`;

        // 📱 Deep Link para la app
        const appResetLink = `myapp://ResetPassword?token=${resetToken}`;

        console.log(`📩 Enviando correo de recuperación a: ${email}`);

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
            <ul>
              <li>📱 <a href="${appResetLink}">Abrir en la aplicación</a></li>
              <li>🌐 <a href="${webResetLink}">Abrir en la web</a></li>
            </ul>
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
  },

  actions: {
    async forgetPassword(ctx) {
      try {
        const { email } = ctx.params;
        if (!email) throw new Error("El campo email es obligatorio.");

        const user = await ctx.call("user.findByEmail", { email });
        if (!user) throw new Error("Usuario no encontrado.");

        // 🔑 Generando token de recuperación...
        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });

        await this.sendRecoveryEmail(email, resetToken);

        return { 
          message: "Correo de recuperación enviado.", 
          links: {
            app: `myapp://ResetPassword?token=${resetToken}`,
            web: `https://miapp.com/ResetPassword?token=${resetToken}`
          }
        };
      } catch (error) {
        throw new Error("Error al enviar el correo: " + error.message);
      }
    },

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
    },
  },
};
