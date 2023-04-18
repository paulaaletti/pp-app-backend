const db = require("../models");
const { activity: Activity} = db;

exports.createActivity = async (req, res) => {
    try {
      const act = await Activity.create({
        title: req.body.title,
        description:req.body.description,
        userId: req.body.userId
      });
      if (!act) {
        return res.status(500).send({ message: "Error creating activity" });
      };
      res.send({ message: "Activity created successfully!" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };

  exports.getUserLatesActivities = async (req, res) => {
      Activity.findAll({
        where: {userId: req.body.id},
        order:[['id','DESC']],
        limit:5,
      })
      .then(async (userAct) => {
        res.status(200).send(userAct);
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
  };

  exports.getUserActivities = async (req, res) => {
    Activity.findAll({
      where: {userId: req.body.id},
      order:[['id','DESC']],
    })
    .then(async (userAct) => {
      res.status(200).send(userAct);
      }).catch(err => {
          res.status(500).send({ message: err.message });
      });
};