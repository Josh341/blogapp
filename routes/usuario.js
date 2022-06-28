const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs") //Encripta senhas
const passport = require("passport")


router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})

router.post("/registro", (req, res) => {
    let erros = []
    let nome = req.body.nome
    let email = req.body.email
    let senha = req.body.senha
    let senha2 = req.body.senha2
    let valores = {
        nome,
        email,
        senha,
        senha2
    }

    if(!nome || typeof nome == undefined || nome == null) {
        erros.push({texto: "Nome inválido!"})
    }

    if(!email || typeof email == undefined || email == null) {
        erros.push({texto: "Email inválido!"})
    }

    if(!senha || typeof senha == undefined || senha == null) {
        erros.push({texto: "Senha inválida!"})
    }

    if(senha.length < 4) {
        erros.push({texto: "Senha muito curta!"})
    }

    if (senha != senha2) {
        erros.push({texto: "As senhas não coincidem"})
    }

    if (erros.length > 0) {
        res.render("usuarios/registro", {erros: erros, valores:valores})
    } else {

        // Verifica se o usuário já existe
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if (usuario) {
                erros.push({texto: "Esse email já foi cadastrado!"})
                res.render("usuarios/registro", {erros: erros, valores:valores})
            } else {
                const novo_usuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                // "salt" é um valor aleatório que é misturado com o hash para dificultar a descoberta da senha
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novo_usuario.senha, salt, (erro, hash) => {
                        if(erro) {
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário!")
                            res.redirect("/")
                        } else {
                            novo_usuario.senha = hash
                            novo_usuario.save().then(() => {
                                req.flash("success_msg", "Cadastro realizado com sucesso!")
                                res.redirect("/")
                            }).catch((erro) => {
                                req.flash("error_msg", "Houve um erro ao criar o usuário! Tente novamente!")
                                res.render("usuarios/registro", {valores:valores})
                            })
                        }
                    })
                })
            }
        }).catch((erro) => {
            req.flash("error_msg", `Houve um erro interno. ERRO: ${erro}`)
            res.redirect("/")
        })
    }
})

router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/", // Rota caso dê certo
        failureRedirect: "/usuarios/login", // Rota se der errado
        failureFlash: true
    })(req, res, next)
})

/* router.get("/logout", (req, res) => {
    req.logout()
    req.flash("success_msg", "Deslogado com sucesso!")
    req.redirect("/")
}) */

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        req.flash('success_msg', "Deslogado com sucesso!")
        res.redirect("/")
    })
    next()
})

module.exports = router