const mongoose = require("mongoose")
const Schema = mongoose.Schema

function data() {
    let agora = new Date();
    let dia = String(agora.getDate() >= 10 ? agora.getDate() : `0${agora.getDate()}`);
    let mes = String(agora.getMonth() >= 10 ? agora.getMonth() : `0${agora.getMonth()}`);
    let ano = String(agora.getFullYear());

    let hora = String(agora.getHours());
    let min = String(agora.getMinutes() >= 10 ? agora.getMinutes() : `0${agora.getMinutes()}`);

    let data = `${dia}/${mes}/${ano} ${hora}:${min}`;

    return data;
}

const Postagem = new Schema({
    titulo: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categorias",
        required: true
    },
    data: {
        type: String,
        default: data()
    }
})

mongoose.model("postagens", Postagem)