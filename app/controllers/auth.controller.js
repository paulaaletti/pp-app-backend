const multer = require('multer');
const db = require("../models");
const config = require("../config/auth.config");
const { user: User, role: Role, refreshToken: RefreshToken, transaction: Transaction, publicProfileInformation: PublicProfileInformation, publicProfileConfiguration: PublicProfileConfiguration, userPersonalInformation: UserPersonalInformation} = db;
const Op = db.Sequelize.Op;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");

const getSubscription = (userId) => {
  return axios.post("http://localhost:8080/api/payment/" + "getSubscription", {
    userId,
  });
};

exports.signup = async (req, res) => {
  try {
    const user = await User.create({
      name: req.body.name,
      lastname: req.body.lastname,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });
    let resultRole;
    if (req.body.role) {
      const role = await Role.findOne({
        where: {
          name: req.body.role,
        },
      });
      resultRole = role;
    }
    const result = user.setRoles(resultRole);
    if(req.body.role === "user"){
      user.setMilestones([1]);
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
            userId: user.id
          });
          if (!profileInfo) {
            res.status(500).send({ message: "Error creating Public Profile URL" });
          };
        } catch (error) {
          res.status(500).send({ message: error.message });
        }
      }).catch(err => {
        res.status(500).send({ message: err.message });
    });
    PublicProfileConfiguration.create({
      userId: user.id,
    });  
    UserPersonalInformation.create({
      userId: user.id,
    });
  };
    if (result) res.send({ message: "El usuario fue registrado exitosamente!",id:user.id});
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
              profilePicture: user.profilePicture,
              createdAt: user.createdAt,
            });
          });
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

exports.getUsersForReport = async (req, res) => {
  try {
    const users = await User.findAll({
      limit: req.body.limit,
      include:[
        { model: PublicProfileInformation, required: true },
      ],
      offset: req.body.offset
    })

      const usersWithTheirInfo = await Promise.all(users.map(async (user) => {
        const userInfo = user.dataValues;
        const userSubscription = await getSubscription(userInfo.id);
        const correctoUserInfo = {
          id: userInfo.id,
          name: userInfo.name,
          lastname: userInfo.lastname,
          email: userInfo.email,
          createdAt: userInfo.createdAt,
          totalAmountDonated: userInfo.publicProfileInformations[0].totalAmountDonated,
          refferalsQuantity: userInfo.publicProfileInformations[0].referralsQuantity,
          hasSubscription: userSubscription ? true : false,
        };
        return correctoUserInfo;
      }));
    res.status(200).send(usersWithTheirInfo);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
};
