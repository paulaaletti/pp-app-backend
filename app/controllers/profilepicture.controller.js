const { Storage } = require('@google-cloud/storage')
const path = require('path')
const httpStatus = require('http-status')
const { gcsKey, gcsProjectId, gcsBucketProfilePhoto } = require('../../config')

const storage = new Storage({
  keyFilename: path.join(__dirname, gcsKey),
  projectId: gcsProjectId
})

const bucket = storage.bucket(gcsBucketProfilePhoto)

exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(httpStatus.BAD_REQUEST).send('None file uploaded')
    }
    const id = req.params.id
    const extension = req.file.originalname.split('.').pop()
    const filePath = `profile-pictures/${id}.jpg`
    const blob = bucket.file(filePath)
    const blobStream = blob.createWriteStream()
    blobStream.on('error', error => {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send(error)
    })

    blobStream.on('finish', () => {
      return res.status(201).send('File uploaded successful')
    })
  
    blobStream.end(req.file.buffer)
  } catch (error) {
    next(error)
  }
}

exports.getProfilePicture = async (req, res, next) => {
  try {
    const id = req.params.id
    const filePath = `profile-pictures/${id}.jpg`
    const remoteFile = bucket.file(filePath)
    remoteFile.createReadStream()
      .on('error', error => {
        return next(error);
      })
      .pipe(res)
  } catch (error) {
    return next(error)
  }
  
}