const { Storage } = require('@google-cloud/storage')
const path = require('path')
const { gcsKey, gcsProjectId, gcsBucketMilestones } = require('../../config')

const storage = new Storage({
  keyFilename: path.join(__dirname, gcsKey),
  projectId: gcsProjectId
})

const bucket = storage.bucket(gcsBucketMilestones)

exports.getMilestonePicture = async (req, res, next) => {
  try {
    const id = req.params.id
    const filePath = `${id}.jpg`
    const remoteFile = bucket.file(filePath)
    remoteFile.createReadStream()
      .on('error', error => {
        return next(error)
      })
      .pipe(res)
  } catch (error) {
    next(error)
  }
  
}