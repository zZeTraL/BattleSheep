exports.logout = (req, res) => {
    req.logout();
    res.send(401);
};