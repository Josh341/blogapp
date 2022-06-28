const mongoose = require("mongoose")
const Schema = mongoose.Schema // Torna mais prático o código

function data() {
    let agora = new Date();
    let dia = String(agora.getDate() > 10 ? agora.getDate() : `0${agora.getDate()}`);
    let mes = String(agora.getMonth() > 10 ? agora.getMonth() : `0${agora.getMonth()}`);
    let ano = String(agora.getFullYear());

    let hora = String(agora.getHours());
    let min = String(agora.getMinutes() > 10 ? agora.getMinutes() : `0${agora.getMinutes()}`);

    let data = `${dia}/${mes}/${ano} ${hora}:${min}`;

    return data;
}

const categoria = new Schema ({
    nome: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    date: {
        type: String,
        default: data()
    }
})

mongoose.model("categorias", categoria)