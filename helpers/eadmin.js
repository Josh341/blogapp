/*
    Esse arquivo verifica se o usuário logado possui credenciais de Administrador
*/

module.exports = {
    eAdmin: function(req, res, next) {
        if (req.isAuthenticated()) {
            if (req.user.admin == 1) {
                return next()
            }
            
            req.flash("error_msg", "Somente administradores tem acesso à essa página!")
            res.redirect("/")
        }

        req.flash("error_msg", "Entre com sua conta para acessar essa página!")
        res.redirect("/")
    }
}