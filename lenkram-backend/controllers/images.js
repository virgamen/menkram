const cloudinary = require('cloudinary');

const User = require('../models/userModels');

cloudinary.config({ 
    cloud_name: 'dqw7z2dqq', 
    api_key: '547357352268962', 
    api_secret: 'dw5cJfSP6uZCfoWVvLaUzMV7ShM' 
  });

module.exports = {
    UploadImage(req, res) {
        cloudinary.uploader.upload(req.body.image, async result => {
            //console.log(result);
          await User.updateOne(
            {
              _id: req.user._id
            },
            {
              $push: {
                images: {
                  imgId: result.public_id,
                  imgVersion: result.version
                }
              }
            }
          )
            .then(() =>
              res
                .status(200)
                .json({ message: 'Image uploaded successfully' })
            )
            .catch(err =>
              res
                .status(500)
                .json({ message: 'Error uploading image' })
            );
        });
      },

    async  setDefault(req, res){
        
         const {imgId, imgVersion} = req.params;


         await User.updateOne(
          {
            _id: req.user._id
          },
          {
            picId: imgId,
            picVersion: imgVersion
          }
        )
          .then(() =>
            res
              .status(200)
              .json({ message: 'Image uploaded successfully' })
          )
          .catch(err =>
            res
              .status(500)
              .json({ message: 'Error uploading image' })
          );
        
      }
}