# Getting started with MinIO

This project was created for the Lection "alternative Databases" by Prof. Dr. David Linner, SRH Berlin School of Design and Communication.

We have build an Express API with a MinioDB to present a alternative Database.

## Dependencies

- ExpressJS
- Minio
- Express-fileupload

## Available Routes

### GET /

This route will return all available buckets.

### POST /create-space

Body:
{
    "name": "MyBucketName"
}

Will create a Bucket with that provided name inside the body. But only creates the buckeet if it's not exists.

### POST /remove-space

Body:
{
    "name": "MyBucketName"
}

Will remove a bucket with the provided name.

### GET /items?name=MyBucketName

Will return all items inside bucket. Bucketname provides inside query.

### GET /item?name=MyBucketName&filename=MyFileName&path=/

This route provides a download of a single file. Required are bucketname, filename and filePath.

### GET /items-in-dir?name=BucketName&prefix=/

Will return all items inside a directory. For this we need the prefix. For Example a folder called "MyPictures" has a prefix of "MyPictures"

### POST /upload

FormData: {
    file: MyFile
    name: MyBucketName
}

This route is used to upload a single file.

### POST /upload-files

FormData: {
    file: MyFile
    name: MyBucketName
    bucketPath: MyPictures
}

This route is used to upload a whole directory.

### GET /item-share?name=MyBucketName&filename=MyFile
(&prefix=MyPictures)

This route will return a preSigned URL. If URL is opened the selected file will be downloaded. You can share this Link with friends etc. At the moment the Link is available for 24 hours. Prefix is not required.