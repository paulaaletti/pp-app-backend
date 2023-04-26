const multer = require('multer');
const db = require("../models");
const config = require("../config/auth.config");
const { user: User, role: Role, refreshToken: RefreshToken, transaction: Transaction, publicProfileURL: PublicProfileURL, publicProfileInformation: PublicProfileInformation} = db;
const Op = db.Sequelize.Op;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  try {
    const user = await User.create({
      name: req.body.name,
      lastname: req.body.lastname,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });
    if (req.body.roles) {
      const roles = await Role.findAll({
        where: {
          name: {
            [Op.or]: req.body.roles,
          },
        },
      });
      const result = user.setRoles(roles);
      if(req.body.roles.includes("user")){
        const resultMile = user.setMilestones([1])};
          createInitialPublicProfileURL(user.id, res);
      if (result) res.send({ message: "El usuario fue registrado exitosamente!",id:user.id});
    } else {
      // user has role = 1
      const result = user.setRoles([1]);
        createInitialPublicProfileURL(user.id, res);
      const resultMile = user.setMilestones([1]);
      if (result) res.send({ message: "El usuario fue registrado exitosamente!",id:user.id});
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
exports.signin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(async (user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Contraseña incorrecta!"
        });
      }
      const token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: config.jwtExpiration
      });
      let refreshToken = await RefreshToken.createToken(user);
      let authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).send({
          id: user.id,
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          roles: authorities,
          accessToken: token,
          refreshToken: refreshToken,
          referralsQuantity: user.referralsQuantity,
          totalAmountDonated: user.totalAmountDonated,
          profilePicture: user.profilePicture,
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;
  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }
  try {
    let refreshToken = await RefreshToken.findOne({ where: { token: requestToken } });
    console.log(refreshToken)
    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }
    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.destroy({ where: { id: refreshToken.id } });
      
      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }
    const user = await refreshToken.getUser();
    let newAccessToken = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.jwtExpiration,
    });
    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({
      message: "You've been signed out!"
    });
  } catch (err) {
    this.next(err);
  }
};

exports.findUserById = async (req, res) => {
  User.findOne({
      where: {
        id: req.body.id,
      },
    })
    .then(async (user) => {
          if (!user) {
            return res.status(200).send(undefined);
          }
          res.status(200).send(user);
      }).catch(err => {
          res.status(500).send({ message: err.message });
      });
}

exports.getUserLifeImpact= async (req, res) => {
  var lifeImpact = 0
  Transaction.findAll({
    where: {userId: req.body.userId},
  })
  .then(async (trans) => {
      if (trans) {
       trans.forEach((t) => {lifeImpact += t.amount})
       lifeImpact = lifeImpact/100
        res.status(200).send(lifeImpact.toString());
      }
    }).catch(err => {
        res.status(500).send({ message: err.message });
    });
}

exports.updateUserInformation = async (req, res) => {
  User.update({
    name: req.body.name,
    lastname: req.body.lastname,
  }, {
    where: {
      id: req.body.userId,
    },
  })
  .then(async (user) => {
    if (user) {
      res.status(200).send(user);
    }
    }).catch(err => {
        res.status(500).send({ message: err.message });
    });
}

exports.getCurrentUser = async (req, res) => {
  User.findOne({
    where: {
      id: req.body.userId,
    },
  })
  .then(async (user) => {
    if (user) {
      res.status(200).send(user);
    }
    }).catch(err => {
        res.status(500).send({ message: err.message });
    });
}

exports.changeUserEmail = async (req, res) => {
    User.update({
      email: req.body.email,
    }, {
      where: {
        id: req.body.userId,
      },
    })
    .then(async (user) => {
      if (user) {
        res.status(200).send(user);
      }
      }).catch(err => {
          res.status(500).send({ message: err.message });
      });
};

function createInitialPublicProfileURL(userId, res){
  User.findOne({
    where: {
      id: userId,
    }
  }).then(async (user) => {
    if (!user) {
      res.status(404).send({ message: "User Not found." });
    }
    if(user){
      User.findAndCountAll({
        where:{
          name: user.name,
          lastname: user.lastname,
        },
      }).then(async(resp)=>{
        if(resp.count>1){
          userUrl = user.name + user.lastname + "-" + resp.count;
        }else{
          userUrl = user.name + user.lastname;
        }
        try {
          const profileInfo = await PublicProfileInformation.create({
            publicProfileUrl: userUrl,
            userId: userId
          });
          if (!profileInfo) {
            res.status(500).send({ message: "Error creating Public Profile URL" });
          };
          res.send({ message: "Public Profile URL created successfully!" });
        } catch (error) {
          res.status(500).send({ message: error.message });
        }
      }).catch(err => {
        res.status(500).send({ message: err.message });
      });
    }
  }).catch(err => {
    res.status(500).send({ message: err.message });
  });
};


const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // set a limit of 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
}).single('image');

exports.setUserProfilePicture = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: err.message });
    }

    const image = req.file.buffer;
    User.update({
        profilePicture: image,
    }, {
      where: {
        id: req.body.id,
      },
    }).then(async (image) => {
        return res.status(200).json({ message: 'Profile picture updated successfully!' });
    }).catch(err => {
        res.status(500).send({ message: err.message });
    });
  });
}