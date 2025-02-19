const ApiGateway = require("moleculer-web");
const jwt = require("jsonwebtoken");

module.exports = (broker) => {
  broker.createService(ApiGateway, {
    name: "api",
    settings: {
      port: 3000,
      routes: [
        {
          path: "/api",
          aliases: {
            "POST /register": "auth.register",
            "POST /login": "auth.login",
            "POST /user-info": "user.getUserInfo",
            "GET /userS-info": "user.listUsers",
            "POST /forget-password": "password.forgetPassword",
            "POST /reset-password": "password.resetPassword",
            "GET /reset-passwordform": "password.redirect",
          },
          cors: true,
          whitelist: ["**"],
          bodyParsers: {
            json: true,
            urlencoded: { extended: true },
          },
          use: [
            async (req, res, next) => {
              // Excluir rutas públicas
              if (req.url = "/api/register" || req.url == "/api/login") {
                return next();
              }

              try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                  res.writeHead(401, { "Content-Type": "application/json" });
                  return res.end(JSON.stringify({ error: "Token no proporcionado" }));
                }

                const token = authHeader.split(" ")[1];
                const secretKey = process.env.JWT_SECRET || "secret_key"; // Asegurar clave JWT
                const decoded = jwt.verify(token, secretKey);
                req.$ctx.meta.user = decoded;
                next();
              } catch (err) {
                res.writeHead(401, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: "Token inválido o expirado" }));
              }
            },
          ],
        },
      ],
      assets: {
        folder: "./public", // 📌 Servir archivos estáticos desde la carpeta "public"
      },
    },
  });
};
