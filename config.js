require('dotenv').config()

module.exports = {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  gcsKey: process.env.GCS_KEY_PATH,
  gcsProjectId: process.env.GCS_PROJECT_ID,
  gcsBucketProfilePhoto: process.env.GCS_BUCKET_NAME_ProfilePhoto,
  gcsBucketMilestones: process.env.GCS_BUCKET_NAME_Milestones,
}