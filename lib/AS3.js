var awssum = require('awssum');
var amazon = awssum.load('amazon/amazon');
var S3 = awssum.load('amazon/s3').S3;
var fs = require('fs');

/*********************
 Abstraction class for amazon S3
*********************/

var AS3 = module.exports = {
    _connect: function(){
    
        var s3 = new S3({
            'accessKeyId'     : process.env.accessKeyId,
            'secretAccessKey' : process.env.secretAccessKey,
            'region'          : amazon.US_EAST_1
        });
        
        return s3;
    },
    
    listImages:function(dir, callback){
        s3 = this._connect();
        
        var options = {
            BucketName : 'mikevalstar',
            MaxKeys : 200,
            Prefix: 'img/' + dir
        };
        
        s3.ListObjects(options,function(err,data){
            if(!err){
                callback(err, data.Body.ListBucketResult);
            }else{
                callback(err);
            }
        });
    },
    
    uploadImage: function(source, dest, content_type, callback){
        s3 = this._connect();
        
        fs.stat(source, function(err, file_info) {
            if (err) {
                callback(err);
                return;
            }
        
            var bodyStream = fs.createReadStream( source );
            var params = {
                BucketName    : 'mikevalstar',
                ObjectName    : 'img/' + dest,
                ContentType   : content_type,
                ContentLength : file_info.size,
                Body          : bodyStream
            };
        
            s3.PutObject(params, callback);
        });
    }
};