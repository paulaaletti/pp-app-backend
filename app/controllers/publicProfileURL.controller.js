const db = require("../models");
const { user: User} = db;
const { publicProfileURL: PublicProfileURL} = db;

exports.createPublicProfileURL = async (req, res) => {
  User.findOne({
    where: {
      id: req.body.userId,
    }
  }).then(async (user) => {
    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }
    console.log(res)
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
          const profileUrl = await PublicProfileURL.create({
            url: userUrl,
            userId: req.body.userId
          });
          if (!profileUrl) {
            return res.status(500).send({ message: "Error creating Public Profile URL" });
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

exports.getPublicProfileURL = async (req, res) => {
    PublicProfileURL.findOne({
        where: {userId: req.body.id},
      })
      .then(async (profileUrl) => {
        res.status(200).send({url : "https://patapila-frontend.vercel.app/signup/" + profileUrl.url});
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
};

exports.changePuplicProfileURL= async(req,res) => {
  User.findOne({
    where: {
      id: req.body.id
    }
  })
    .then(async (user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      const passwordIsValid = bcrypt.compareSync(
        req.body.oldpassword,
        user.password
      );
      if (passwordIsValid) {
        try{
          User.upsert({id: req.body.id,password: bcrypt.hashSync(req.body.password, 8),});
        }
        catch (error) {
          res.status(500).send({ message: err.message });
        }
        res.status(200).send({message: "La contraseña se ha cambiado exitosamente"})
      }
      else{
        res.status(500).send({message: "La contraseña antigua es incorrecta"});
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};