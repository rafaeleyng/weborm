var AWS = require('aws-sdk'),
  fs = require('fs'),
  s3 = new AWS.S3(),
  filename = 'modeljs.min.js',
  version = '0.0.1';

var objectContent = fs.readFileSync(filename).toString();
var params = {
  Bucket: 'modeljs', 
  Key: version + '/' + filename, 
  Body: objectContent, 
  ACL: 'public-read', 
  ContentEncoding:'text/javascript'
};

s3.putObject(params, function(err, url) {
  if (err) {
    console.log('### ERROR', err);
    return;
  }
  console.log('ETag', url.ETag);
});
