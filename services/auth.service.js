const { Service } = require("moleculer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  name: "auth",

  methods: {
    isValidPassword(password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return passwordRegex.test(password);
    },
  },

  actions: {
    async register(ctx) {
      const { username, email, password } = ctx.params;
      if (!username || !email || !password) throw new Error("Todos los campos son obligatorios.");

      if (!this.isValidPassword(password)) {
        throw new Error("La contraseña debe cumplir los requisitos de seguridad.");
      }

      try {
        const existingUser = await ctx.call("user.findByEmail", { email });
        if (existingUser) throw new Error("El email ya está registrado.");

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await ctx.call("user.create", { username, email, password: hashedPassword });

        return { message: "Usuario registrado exitosamente", user };
      } catch (error) {
        throw new Error("Error al registrar el usuario: " + error.message);
      }
    },

    async login(ctx) {
      const { email, password } = ctx.params;
      if (!email || !password) throw new Error("Los campos email y password son obligatorios.");

      try {
        const user = await ctx.call("user.findByEmail", { email });
        if (!user) throw new Error("Usuario no encontrado.");

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error("Contraseña incorrecta.");

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        return { message: "Inicio de sesión exitoso", token, username: user.username };
      } catch (error) {
        throw new Error("Error al iniciar sesión: " + error.message);
      }
    },
  },
};