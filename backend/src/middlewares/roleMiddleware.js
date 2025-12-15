const allowRoles = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.sendStatus(403);
    }
    next();
  };
};

export default allowRoles;
