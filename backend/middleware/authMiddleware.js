const jwt = require('jsonwebtoken');
require('dotenv').config();

// Este middleware permanece inalterado
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: "Acesso negado. Nenhum token fornecido." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token inválido ou expirado." });
        }
        req.user = user;
        next();
    });
}

// ======================= NOVO MIDDLEWARE =======================
// Este middleware verifica se o usuário tem o perfil 'ADMIN'.
// Ele deve ser executado DEPOIS do 'verifyToken'.
function checkAdmin(req, res, next) {
    // O middleware 'verifyToken' já colocou os dados do usuário no 'req.user'
    if (req.user && req.user.perfil === 'ADMIN') {
        next(); // O usuário é ADMIN, pode prosseguir para a rota.
    } else {
        // Se não for ADMIN, retorna um erro de "Acesso Proibido".
        res.status(403).json({ error: "Acesso negado. Requer perfil de Administrador." });
    }
}
// ===============================================================

// Atualiza as exportações para incluir o novo middleware
module.exports = {
    verifyToken,
    checkAdmin 
};
