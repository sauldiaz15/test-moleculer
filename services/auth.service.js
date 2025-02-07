const { Service } = require("moleculer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  name: "auth",

  // Métodos personalizados
  methods: {
    // Método para validar la contraseña
    isValidPassword(password) {
      console.log(password)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return passwordRegex.test(password);
    },
  },

  actions: {
    // Registro de usuario
    async register(ctx) {
      const { username, email, password } = ctx.params;

      if (!username || !email || !password) {
        throw new Error("Todos los campos (username, email, password) son obligatorios");
      }

      // Validar la seguridad de la contraseña
      if (!this.isValidPassword(password)) {
        throw new Error(
          "La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula, una minúscula, un número y un carácter especial."
        );
      }

      try {
        // Verificar si el email ya está registrado llamando al servicio de usuario
        const existingUser = await ctx.call("user.findByEmail", { email });
        if (existingUser) {
          throw new Error("El email ya está registrado");
        }

        // Cifrar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el usuario llamando al servicio de usuario
        const user = await ctx.call("user.create", {
          username,
          email,
          password: hashedPassword,
        });

        return { message: "Usuario registrado exitosamente", user };
      } catch (error) {
        throw new Error("Error al registrar el usuario: " + error.message);
      }
    },

    // Inicio de sesión
    async login(ctx) {
      const { email, password } = ctx.params;

      if (!email || !password) {
        throw new Error("Los campos email y password son obligatorios");
      }

      try {
        // Buscar al usuario por email llamando al servicio de usuario
        const user = await ctx.call("user.findByEmail", { email });
        if (!user) {
          throw new Error("Usuario no encontrado");
        }

        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Contraseña incorrecta");
        }

        // Generar el token JWT
        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET || "secret_key",
          { expiresIn: "1h" }
        );
        
        return { message: "Inicio de sesión exitoso", token, username: user.username };
      } catch (error) {
        throw new Error("Error al iniciar sesión: " + error.message);
      }
    },
  },
};
