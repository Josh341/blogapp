const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// Model de usuário
require("../models/usuario")
const Usuario = mongoose.model("usuarios")

module.exports = function (passport) {
    // "usernameField" é o campo que irá ser analizado.
    // Poderia ser CPF, Nome normal, nome de usuário, etc...
    passport.use(new localStrategy({usernameField: "email", passwordField: "senha"}, (email, senha, done) => {
        Usuario.findOne({email: email}).then((usuario) => {
            if (!usuario) {
                return done(null, false, {message: "Essa conta não existe"})
                // Campos: dados da conta, se a autenticação ocorreu, mensagem de retorno
            }
            bcrypt.compare(senha, usuario.senha, (erro, senhas_batem) => {
                if(senhas_batem) {
                    return done(null, usuario)
                } else {
                    return done(null, false, {message: "Senha Incorreta"})
                }
            })
        })
    }))

    // Salva os dados do usuário em uma sessão
    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    // Procura um usuário pelo seu id
    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (erro, usuario) => {
            done(erro, usuario)
        })
    })
}