var express = require('express');
var router = express.Router();
const Minio = require("minio");
const fs = require("fs");
var PATH = require('path');


// Minio Connection aufbauen
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'AKIAIOSFODNN7EXAMPLE', // User
  secretKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' // passwort
});

// Alle Buckets auslesen
router.get('/', async function(req, res, next) {
  await minioClient.listBuckets((err, buckets) => {
    if(err) return console.log(err);

    res.json(buckets);
  });
});

// Bucket erstellen
router.post('/create-space', async (req, res) => {
  const {name} = req.body;
  console.log(name)
  // nur erstellen wenn bucket nicht exestiert
  await minioClient.bucketExists(name, async function(err, exists) {
    console.log('here')
    if (err) {
      return console.log(err)
    }
    if (!exists) {
      await minioClient.makeBucket(name, 'eu-west-1', function(err) {
        if (err) return console.log('Error creating bucket.', err)
        res.json({created: true})
      })
    }
  })
})

// Löschen eines Buckets
router.post('/remove-space', (req, res) => {
  const {name} = req.body
  minioClient.removeBucket(name, function(err) {
    if (err) return console.log('unable to remove bucket.')
    res.json({removed: true});
  })
})

router.get('/items', (req, res) => {
  const {name} = req.query;
  // const stream = minioClient.listObjectsV2(name,'', true,'')
  // stream.on('data', function(obj) {
  //   console.log(obj)
  //   // res.sendFile(obj)
  // } )
  // stream.on('error', function(err) { console.log(err) } )

  let objs = [];
  let temps = [];
  // Alle Objecte und Metadaten
  var stream = minioClient.listObjectsV2(name,'', true,'')
  stream.on('data', function(obj) { 
    let name = obj.name.split('/')
    let bool = false
    if(name.length >= 2){
      temps.map(temp => {
        if(temp === name[0]){
          bool = true
        }else{
          bool = false
        }
      })
      if(bool){
        bool = false
      }else{
        objs.push({name: name[0], type: 'dir'})
        temps.push(name[0])
      }
    }else{
      objs.push(obj) 
    }
    
  })
  stream.on('error', function(err) { console.log(err) } )
  stream.on('end', () => {
    res.json(objs)
  })
  // let file;
  // minioClient.getObject('test', 'Bild3.png', function(err, dataStream) {
  //   if (err) {
  //     return console.log(err)
  //   }
  //   dataStream.on('data', function(chunk) {
  //     file = chunk
  //   })
  //   dataStream.on('end', function() {
  //     res.send(file)
  //     console.log('End. Total size = ')
  //   })
  //   dataStream.on('error', function(err) {
  //     console.log(err)
  //   })
  // })
})

// einzelns File
router.get('/item', (req, res) => {
  const {name, filename, path} = req.query;
  let file;
  // speichern die Datei lokal
  minioClient.fGetObject(name,path, `upload/${filename}`, function(err, dataStream) {
    if (err) {
      return console.log(err)
    }
    console.log(dataStream);
    let test = PATH.resolve('./')
    console.log(`${test}/upload/${filename}`);
    res.download(`${test}/upload/${filename}`)
  })
})

router.get('/items-in-dir', (req, res) => {
  const {name, prefix} = req.query;

  let objs = [];
  let temps = [];
  var stream = minioClient.listObjectsV2(name,prefix, true,'')
  stream.on('data', function(obj) { 
    let name = obj.name.split('/')
    let bool = false
    if(name.length >= name.length+1){
      temps.map(temp => {
        if(temp === name[0]){
          bool = true
        }else{
          bool = false
        }
      })
      if(bool){
        bool = false
      }else{
        objs.push({name: name[0], type: 'dir'})
        temps.push(name[0])
      }
    }else{
      objs.push(obj) 
    }
    
  })
  stream.on('error', function(err) { console.log(err) } )
  stream.on('end', () => {
    res.json(objs)
  })
})

// Upload single file
router.post('/upload', (req, res) => {
  let file = req.files.file
  const {name} = req.body
  if(!file){
    return res.status(404).json({message: "Datei wurde nicht korrekt hochgeladen"})
  }
  minioClient.putObject('test', file.name, file.data, file.metaData, function(err, etag) {
    if (err) return console.log(err)
    console.log('File uploaded successfully.')
  });
})

router.post('/upload-share', async (req, res) => {
  let file = req.files.files
  let url;
  const {name} = req.body
  if(!req.files.files){
    return res.status(404).json({message: "Datei wurde nicht korrekt hochgeladen"})
  }
  await minioClient.putObject(name, file.name, file.data, file.metaData, async function(err, etag) {
    if (err) return console.log(err)
    minioClient.presignedGetObject(name, file.name, 24*60*60, async (err, presignedUrl) => {
      if (err) return console.log(err)
      return url=presignedUrl
    })
    console.log(url);
    res.json({uploaded: true, url: url});
  });
})

// Upload multiple files (dir)
router.post('/upload-files', (req, res) => {
  // let file = req.files.files.map((file) => { console.log(file);})
  let file = req.files.file
  let path = req.body.pathtest
  console.log(file);
  console.log(path);
  if(!file){
    return res.status(404).json({message: "Datei wurde nicht korrekt hochgeladen"})
  }
  minioClient.putObject('test', path, file.data, file.metaData, function(err, etag) {
    if (err) return console.log(err)
    console.log('File uploaded successfully.')
    res.json({uploaded: true})
  });
})

// generate share link
router.get('/item-share', (req, res) => {
  let {name, filename, prefix} = req.query;
  // presigned url for 'listObject' method.
  // Lists objects in 'myBucket' with prefix 'data'.
  // Lists max 1000 of them.

filename = filename === undefined ? '' : filename
prefix = prefix === undefined ? '' : prefix
console.log(prefix);
console.log(filename);
minioClient.presignedUrl('GET', name, filename, 24*60*60, {'prefix': prefix, 'max-keys': 1000}, function(err, presignedUrl) {
  if (err) return console.log(err)
  console.log(presignedUrl)
})
})

module.exports = router;
