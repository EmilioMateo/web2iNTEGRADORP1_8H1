class User {
    constructor({ id, correo, username, password, rol }) {
        this.id = id;
        this.correo = correo || username;
        this.password = password;
        this.rol = rol;
    }
}

module.exports = User;
