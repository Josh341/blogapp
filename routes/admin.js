const express = require("express")
const router = express.Router() //Componente usado para criar rotas em arquivos separados
const mongoose = require("mongoose")
require("../models/categoria")
const Categoria = mongoose.model("categorias")
require("../models/postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eadmin")

router.get("/", eAdmin, (req, res) => {
    res.render("admin/index")
})

router.get("/posts", (req, res) => {
    res.send("Página de posts")
})

// O parâmetro "eAdmin" torna acessível essa página apenas para pessoas que possuem credenciais de administrador
router.get("/categorias", eAdmin, (req, res) => {
    Categoria.find().lean().sort({nome: "ASC"}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias! :(")
        res.redirect("/admin")
    })
})

router.get("/categorias/add", eAdmin, (req, res) => {
    res.render("admin/addcategorias")
})

router.post("/categorias/nova", eAdmin, (req, res) => {
    let erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null || req.body.nome.length <= 2) {
        erros.push({texto: "Nome inválido!"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null || req.body.slug.length <= 2) {
        erros.push({texto: "Slug inválido!"})
    }

    if(erros.length > 0) {
        res.render("admin/addcategorias", {erros: erros})
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
                req.flash("success_msg", "Categoria criada com sucesso! :)")
                res.redirect("/admin/categorias")
            }).catch((erro) => {
                req.flash("error_msg", `Houve um erro ao registrar a categoria! :(\nERRO: ${erro}`)
                res.redirect("/admin")
            })
    }
})

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch((erro) => {
        req.flash("error_msg", "Essa categoria não existe!")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", eAdmin, (req, res) => {
    let erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null || req.body.nome.length <= 2) {
        erros.push({texto: "Nome inválido!"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null || req.body.slug.length <= 2) {
        erros.push({texto: "Slug inválido!"})
    }

    if(erros.length > 0) {
        res.render("admin/editcategorias", {erros: erros})
    } else {
        Categoria.findOne({_id:req.body.id}).then((categoria) => {
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            Categoria(categoria).save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso! :)")
                res.redirect("/admin/categorias")
            }).catch((erro) => {
                req.flash("error_msg", `Houve um erro interno ao salvar a categoria! :(\nERRO: ${erro}`)
                res.redirect("/admin/categorias")
            })

        }).catch((erro) => {
            req.flash("error_msg", `Houve um erro na edição da categoria! :(\nERRO: ${erro}`)
            res.redirect("/admin/categorias")
        })
    }
})

router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso! :)")
        res.redirect("/admin/categorias")
    }).catch((erro) => {
        req.flash("error_msg", `Houve um erro ao deletar a categoria! :(\nERRO: ${erro}`)
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", eAdmin, (req, res) => {
    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((erro) => {
        req.flash("error_msg", `Houve um erro ao listar as postagens!`)
        res.redirect("/admin")
    })
    
})

router.get("/postagens/add", eAdmin, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((erro) => {
        req.flash("error_msg", `Houve um erro ao carregar as categorias!`)
        res.redirect("/admin")
    })
})

router.post("/postagens/nova", eAdmin, (req, res) => {
    let erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null || req.body.titulo.length <= 2) {
        erros.push({texto: "Título inválido!"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null || req.body.slug.length <= 2) {
        erros.push({texto: "Slug inválido!"})
    }

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null || req.body.descricao.length <= 2) {
        erros.push({texto: "Descrição inválida!"})
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null || req.body.conteudo.length <= 2) {
        erros.push({texto: "Conteúdo inválido!"})
    }

    if(req.body.categoria == 0) {
        erros.push({texto: "Categoria inválida!"})
    }

    if(erros.length > 0) {
        res.render("admin/addpostagem", {erros: erros})
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
        }
        new Postagem(novaPostagem).save().then((categoria) => {
            req.flash("success_msg", "Postagem criada com sucesso! :)")
            res.redirect("/admin/postagens")
        }).catch((erro) => {
            req.flash("error_msg", `Houve um erro interno ao salvar a postagem! :(`)
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagens/edit/:id", eAdmin, (req, res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((erro) => {
            req.flash("error_msg", `Houve um erro ao carregar as categorias!`)
            res.redirect("/admin/postagens")
        })
    }).catch((erro) => {
        req.flash("error_msg", `Houve um erro ao carregar o formulário de edição!`)
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/edit", eAdmin, (req, res) => {
    let erros = []

    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null || req.body.titulo.length <= 2) {
        erros.push({texto: "Título inválido!"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null || req.body.slug.length <= 2) {
        erros.push({texto: "Slug inválido!"})
    }

    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null || req.body.descricao.length <= 2) {
        erros.push({texto: "Descrição inválida!"})
    }

    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null || req.body.conteudo.length <= 2) {
        erros.push({texto: "Conteúdo inválido!"})
    }

    if(req.body.categoria == 0) {
        erros.push({texto: "Categoria inválida!"})
    }

    if(erros.length > 0) {
        res.render("admin/addpostagem", {erros: erros})
    } else {
        Postagem.findOne({_id:req.body.id}).then((postagem) => {
            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            Postagem(postagem).save().then(() => {
                req.flash("success_msg", "Postagem editada com sucesso! :)")
                res.redirect("/admin/postagens")
            }).catch((erro) => {
                req.flash("error_msg", `Houve um erro interno ao editar a postagem! :(\nERRO: ${erro}`)
                res.redirect("/admin/postagens")
            })

        }).catch((erro) => {
            req.flash("error_msg", `Houve um erro na edição da postagem! :(\nERRO: ${erro}`)
            res.redirect("/admin/postagens")
        })
    }
})

// Forma não tão segura de deletar (só pra ensinar)
router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso! :)")
        res.redirect("/admin/postagens")
    }).catch((erro) => {
        req.flash("error_msg", `Houve um erro interno ao deletar a postagem! :(\nERRO: ${erro}`)
        res.redirect("/admin/postagens")
    })
})


module.exports = router