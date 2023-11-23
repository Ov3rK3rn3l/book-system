const AWS = require('aws-sdk');

module.exports = {
    IAM_USER_KEY: 'AKIARRWDHFONRFYCGDQ5',
    IAM_USER_SECRET: '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',
    BUCKET_NAME: 'plena-dep',
    AWS_REGION: 'us-east-1',
    uploadToS3: function (file, filename) {
        return new Promise((resolve, reject) => {
            let IAM_USER_KEY = this.IAM_USER_KEY;
            let IAM_USER_SECRET = this.IAM_USER_SECRET;
            let BUCKET_NAME = this.BUCKET_NAME;

            let s3bucket = new AWS.S3({
                accessKeyId: IAM_USER_KEY,
                secretAccessKey: IAM_USER_SECRET,
                Bucket: BUCKET_NAME,
            });

            var params = {
                Bucket: BUCKET_NAME,
                Key: filename,
                Body: file.data,
            };

            s3bucket.upload(params, function (err, data) {
                if (err) {
                    console.log(err);
                    return reject({ error: true, message: err.message });
                }
                console.log(data);
                return resolve({ error: false, message: data });
            });
        });
    },
    deleteFileS3: function (key) {
        return new Promise((resolve, reject) => {
            let IAM_USER_KEY = this.IAM_USER_KEY;
            let IAM_USER_SECRET = this.IAM_USER_SECRET;
            let BUCKET_NAME = this.BUCKET_NAME;

            let s3bucket = new AWS.S3({
                accessKeyId: IAM_USER_KEY,
                secretAccessKey: IAM_USER_SECRET,
                Bucket: BUCKET_NAME,
            });

            s3bucket.deleteObject(
                {
                    Bucket: BUCKET_NAME,
                    Key: key,
                },
                function (err, data) {
                    if (err) {
                        console.log(err);
                        return reject({ error: true, message: err.message });
                    }
                    console.log(data);
                    return resolve({ error: false, message: data });
                }
            );
        });
    },
};
