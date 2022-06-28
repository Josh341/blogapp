// Módulos
const express = require("express")
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const app = express()
const admin = require("./routes/admin") // Importa as rotas do arquivo admin.js
const path = require("path")
const mongoose = require("mongoose")
const session = require("express-session") // Cria uma sessão de usuário
const flash = require("connect-flash") // Exibe mensagens temporárias ao usuário
require("./models/categoria")
const Categoria = mongoose.model("categorias")
require("./models/postagem")
const Postagem = mongoose.model("postagens")
const usuarios = require("./routes/usuario")
const passport = require("passport")
require("./config/auth")(passport)
// Configurações
    // Sessão

// A ordem do "app.use" abaixo até "middleware" deve ser respeitada!
app.use(session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
    // Middleware
app.use((req, res, next) => {
    // "res.locals" define uma variável global
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null
    if (typeof req.user != undefined && req.user != undefined) {
        res.locals.adm = req.user.admin == 1 ? true : false
        res.locals.nome = req.user.nome
    }
    
    next()
})
    // Body Parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
    // Handlebars
app.engine("handlebars", handlebars.engine({defaultLayout: "main"}))
app.set("view engine", "handlebars")
    // Mongoose
    mongoose.Promise = global.Promise
    mongoose.connect("mongodb://localhost/blogapp").then(() => {
        console.log("Conectado ao banco de dados!")
    }).catch((erro) => {
        console.log("Erro de conexão com o banco de dados!")
    })
    // Public (Pasta de arquivos estáticos)
app.use(express.static(path.join(__dirname, "public"))) // Diz que a pasta com os arq. estáticos é a "public"

/* app.use((req, res, next) => {
    console.log("Olá! Eu sou um middleware.")
    next()
}) */
    // Rotas
app.get("/", (req, res) => {
    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
        res.render("index", {postagens: postagens})
    }).catch((erro) => {
        req.flash("error_msg", `Houve um erro interno!`)
        res.render("404", {erro: erro})
    })
})

app.get("/postagem/:slug", (req, res) => {
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
        if (postagem) {
            res.render("postagem/index", {postagem: postagem})
        } else {
            req.flash("error_msg", `Esta postagem não existe!`)
            res.redirect("/")
        }
    }).catch((erro) => {
        req.flash("error_msg", `Houve um erro interno!`)
        res.redirect("/")
    })
})

app.get("/categorias", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("categorias/index", {categorias: categorias})
    }).catch((erro) => {
        req.flash("error_msg", `Houve um erro interno ao listar as categorias!`)
        res.redirect("/")
    })
})

app.get("/categorias/:slug", (req, res) => {
    Categoria.findOne({slug: req.params.slug}).then((categoria) => {
        if (categoria) {
            Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                res.render("categorias/postagens", {postagens: postagens, categoria: categoria, nome: categoria.nome})
            }).catch((erro) => {
                req.flash("error_msg", `Houve um erro ao listar os posts! ${erro}`)
                res.redirect("/")
            })
        } else {
            req.flash("error_msg", `Esta categoria não existe!`)
            res.redirect("/")
        }
    }).catch((erro) => {
        req.flash("error_msg", `Houve um erro interno ao carregar a categoria!`)
        res.redirect("/")
    })
})

app.use("/admin", admin) //Linkou as rotas do arquivo separado à principal (usar o prefixo "/admin/" antes da rota)

app.use("/usuarios", usuarios)

app.use((req, res) => {
    res.render("404", {erro: "Não encontrado"})
})


// Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log(`Servidor rodando na url "http://localhost:${PORT}"`)
})