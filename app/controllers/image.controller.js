const db = require("../models");
const multer = require('multer');
const {image: Image} = db;

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

exports.uploadImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: err.message });
    }

    const image = req.file.buffer;
    const newImage = await Image.create({ image });

    return res.status(200).json({ message: 'Image uploaded successfully!' });
  });
};



// API endpoint to retrieve an image by ID
exports.getImage = async (req, res) => {
  const { id } = req.params;

  // Find the image instance by ID
  Image.findOne({
    where: {
      id: id,
    }
  }).then(async (image) => {
    res.send(image.image);
  }).catch(err => {
      res.status(500).send({ message: err.message });
  });
};
