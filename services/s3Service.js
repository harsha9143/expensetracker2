const AWS = require("aws-sdk");

exports.uploadToS3 = async (data, fileName) => {
  try {
    const BUCKET_NAME = process.env.S3_BUCKET_NAME;
    const S3_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
    const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

    const s3bucket = await new AWS.S3({
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    });

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: data,
      ACL: "public-read",
    };
    const response = await s3bucket.upload(params).promise();
    return response.Location;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};
