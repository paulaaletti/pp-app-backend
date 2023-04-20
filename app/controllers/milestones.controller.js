const db = require("../models");
const multer = require('multer');
const { user: User, milestone:Milestone} = db;

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

exports.createMilestone = async (req, res) => {
    try {
      const milestone = await Milestone.create({
        title: req.body.title,
        description:req.body.description,
      });
      if (!milestone) {
        return res.status(500).send({ message: "Error creating milestone" });
      };
      res.send({ message: "Milestone created successfully!" });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
};

  exports.getUserWithMilestones = async (req, res) => {
      User.findOne({
        where: {id: req.body.userId},
        include: [
          db.milestone,
        ],
      })
      .then(async (userData) => {
        res.status(200).send(userData);
        }).catch(err => {
            res.status(500).send({ message: err.message });
        });
  };

exports.addImageToMilestone = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: err.message });
    }

    const image = req.file.buffer;
    Milestone.update({
      icon: image,
    }, {
      where: {
        id: req.body.id,
      },
    }).then(async (image) => {
        return res.status(200).json({ message: 'Image updated successfully!' });
    }).catch(err => {
        res.status(500).send({ message: err.message });
    });
  });
}