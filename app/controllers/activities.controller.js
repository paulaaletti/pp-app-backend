const multer = require('multer');
const db = require("../models");
const { activity: Activity, activityTyped: ActivityTyped} = db;

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
}).single('icon');

exports.createActivityType = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: err.message });
    }
    const icon = req.file.buffer;
    const act = await ActivityTyped.create({
      title: req.body.title,
      icon: icon,
    }).then(async (image) => {
        return res.status(200).json({ message: 'Activity Type created successfully!' });
    }).catch(err => {
        res.status(500).send({ message: err.message });
    });
  });
};

exports.createActivity = async (req, res) => {
    try {
      const act = await Activity.create({
        activityTypeId: req.body.activityTypeId,
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
        include: [{
          model: ActivityTyped,
          required: true
        }],
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
      include: [{
        model: ActivityTyped,
        required: true
      }],
    })
    .then(async (userAct) => {
      res.status(200).send(userAct);
      }).catch(err => {
          res.status(500).send({ message: err.message });
      });
};