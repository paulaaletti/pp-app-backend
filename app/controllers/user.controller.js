exports.allAccess = (_req, res) => {
    res.status(200).send("Public Content.");
  };
  exports.userBoard = (_req, res) => {
    res.status(200).send("User Content.");
  };
  exports.adminBoard = (_req, res) => {
    res.status(200).send("Admin Content.");
  };
  