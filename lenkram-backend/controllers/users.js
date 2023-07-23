

const User = require('../models/userModels');
const moment = require('moment');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

module.exports = {
   async GetAllUsers(req, res){

       await User.find({})
       .populate('posts.postId')
       .populate('following.userFollowed')
       .populate('followers.follower')
       .populate('chatList.receiverId')
       .populate('chatList.msgId')
       .populate('notifications.senderId')
       .then( result =>{
         res.status(200).json({message:'All Users', result});
       }).catch(err=>{
        res.status(500).json({message:'Error Occured'});
       })
    },

    async GetUser(req, res){

      await User.findOne({_id:req.params.id})
      .populate('posts.postId')
      .populate('following.userFollowed')
      .populate('followers.follower')
      .populate('chatList.receiverId')
      .populate('chatList.msgId')
      .populate('notifications.senderId')
    
      .then(result =>{
        res.status(200).json({message:'User by id', result});
      }).catch(err=>{
       res.status(500).json({message:'Error Occured'});
      })
   },

   async GetUserByName(req, res){

     await User.findOne({username:req.params.username})
     .populate('posts.postId')
     .populate('following.userFollowed')
     .populate('followers.follower')
     .populate('chatList.receiverId')
     .populate('chatList.msgId')
     .populate('notifications.senderId')

     .then(result =>{
       res.status(200).json({message:'User by username', result});
     }).catch(err=>{
      res.status(500).json({message:'Error Occured'});
     })
  },

  async ProfileView(req, res){

    console.log(req.body.id);
    const dateValue = moment().format('YYYY-MM-DD');
    console.log(dateValue);
    await User.updateOne(
      {
        _id: req.body.id,
        //'notifications.date': { $ne: [dateValue, ''] },
        //'notifications.senderId': {$ne:req.user._id}
      },
      {
        $push: {
          notifications: {
            senderId: req.user._id,
            message: `${req.user.username} viewed your profile`,
            created: Date.now(),
            date: dateValue,
            viewProfile: true
          }
        }
      }).then(() =>{
      res.status(200).json({message:'notification sent.'});
    }).catch(err=>{
      //console.log(err);
     res.status(500).json({message:'Error Occured'});
    })

  },

 async ChangePassword(req ,res){
    const schema = Joi.object().keys({
      cpassword: Joi.string().required(),
      NewPassword:Joi.string().min(6).required(),
      ConfirmPassword:Joi.string().min(6).required().optional()


    });
    const {error, value} = schema.validate(req.body); /// แก้ code Joi ตัวใหม่
    if(error && error.details){
      return res.status(400).json({message: error.details});
    }

      const user = await User.findOne({
             _id:req.user._id
      })

      return bcrypt.compare(value.cpassword, user.password).then( async (result)=>{
        if(!result){
          res.status(500).json({message:'Password incorrect!!'});
          
        }else{

          const newpassword = await User.EncryptPassword(req.body.NewPassword);

          //console.log(newpassword);
          await User.updateOne({
            _id: req.user._id
          },{
             password:newpassword
          }).then(() =>{
            return  res.status(200).json({message:'Your password updated.'});
          }).catch(err=>{
            //console.log(err);
            //return  res.status(500).json({message:'Error Occured'});
          });

        }

      

      });
  }
}