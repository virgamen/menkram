const Joi = require('joi');

const Post = require('../models/postsModels');
const User  =require('../models/userModels');
const cloudinary = require('cloudinary');
const moment = require('moment');
const request = require('request');


cloudinary.config({ 
   cloud_name: 'dqw7z2dqq', 
   api_key: '547357352268962', 
   api_secret: 'dw5cJfSP6uZCfoWVvLaUzMV7ShM' 
 });


module.exports = {
    AddPost(req, res){
        //console.log(req.cookies);
        //console.log(req.user);

        const schema = Joi.object().keys({
           
            post:Joi.string().required()
            
         });

         const body = {
            post: req.body.post
         }

         const {error} = schema.validate(body);

         if(error && error.details){
            return res.status(400).json({msg:error.details});
         }

         const bodyObj = {
            user: req.user._id,
            username: req.user.username,
            post: req.body.post,
            created: new Date(),

         }

         if(req.body.post && !req.body.image){

            Post.create(bodyObj).then( async post =>{

               await User.updateOne({
                   _id: req.user._id,
   
               },{
                   $push:{
                       posts:{
                       postId: post._id,
                       post: req.body.post,
                       created: new Date()
   
   
                             }
                      }
               });
   
                res.status(200).json({message:'Post Created!!', post});
   
            }).catch(err=>{
   
                res.status(500).json({message:'Error Ocured!!'});
   
            })
             
         }

         if(req.body.post && req.body.image){

            cloudinary.uploader.upload(req.body.image, async (result)=>{

               const reqBody={
                  user: req.user._id,
            username: req.user.username,
            post: req.body.post,
            imgId: result.public_id,
            imgVersion:result.version,
            created: new Date(),
               }

               Post.create(reqBody).then( async post =>{

                  await User.updateOne({
                      _id: req.user._id,
      
                  },{
                      $push:{
                          posts:{
                          postId: post._id,
                          post: req.body.post,
                          created: new Date()
      
      
                                }
                         }
                  });
      
                   res.status(200).json({message:'Post Created!!', post});
      
               }).catch(err=>{
      
                   res.status(500).json({message:'Error Ocured!!'});
      
               })
      

            })
             
         }

        
    },
    async  GetAllPosts(req, res){
   
      try{

         const today = moment().startOf('day');
         const tomorrow = moment(today).add(1, 'days');

        const posts = await Post.find({
         //created: {$gte: today.toDate(), $lt: tomorrow.toDate()}
        })
        .populate('user')
        .sort({created:-1});

        const top = await Post.find({
         totalLikes:{$gte:2},
         //created: {$gte: today.toDate(), $lt: tomorrow.toDate()}
      })
        .populate('user')
        .sort({created:-1});

      
        const user = await User.findOne({_id: req.user._id});
        if(user.country === '' && user.city===''){
          request('https://api.db-ip.com/v2/free/self/ipAddress',{json:true},
          async(err,res,body)=>{
             //console.log(body);
             const ip_address = body;

                request('https://api.db-ip.com/v2/free/'+ip_address,{json:true},
                   async(err,res,body)=>{
                      //console.log(body);
                      await User.updateOne({
                        _id:req.user._id
                      },{
                          city:body.city,
                          country:body.countryName

                      })
                   }
                )

          }
          )
        }
      
      
        return res.status(200).json({message:'All posts', posts, top});
      }catch(err){
        return res.status(500).json({message:'Error Occured!!'});
      }
    },

    async AddComment(req, res){

         const postId = req.body.postId;

         await Post.updateOne({
           _id: postId
         },{
             $push: {
                comments: {
                   userId: req.user._id,
                   username: req.user.username,
                   comment: req.body.comment,
                   createdAt : new Date()

                }
             }
         }).then(()=>{
              res.status(200).json({message:'Comment added to post'});
         }).catch(err=>{
            res.status(500).json({message:'Error Occured'});
         })

    },

   async AddLike(req, res){

      console.log(req.user);

      const postId = req.body._id;

      const addLikeUser = async ()=>{

         await Post.updateOne({
            _id: postId,
            'likes.username': {$ne:req.user.username}
          },{
              $push: {
                 likes: {
                    username: req.user.username
                 }
              },
              $inc:{totalLikes:1}
          })
     

          //console.log(req.user);

         //  await User.updateOne(

         //    {
         //          _id: req.body._id,
         //          //'notifications.date': { $ne: [dateValue, ''] },
         //          //'notifications.senderId': {$ne:req.user._id}
         //        },
         //        {
         //          $push: {
         //            notifications: {
         //              senderId: req.user._id,
         //              message: `${req.user.username} liked your post.`,
         //              created: Date.now(),
         //              date: dateValue,
         //              viewProfile: false
         //            }
         //          }
         //        }).then(()=>{

         //          console.log('pass here');

         //        })

      }

   
      addLikeUser()
      .then(()=>{
        res.status(200).json({message:'send like completely.'});
      })
      .catch(err=>{
       res.status(500).json({message:'Error Ocured!'});
      })
     



 },
 

 async AddLikeView(req, res){

   //console.log('post id =>' + req.body.postData.postId._id);

   //console.log('sender username =>' + req.body.user.username);

   const postId = req.body.postData.postId._id;

   const addLikeUser = async ()=>{

      await Post.updateOne({
         _id: postId,
         'likes.username': {$ne:req.body.user.username}
       },{
           $push: {
              likes: {
                 username: req.body.user.username
              }
           },
           $inc:{totalLikes:1}
       })
  

     
   }


   addLikeUser()
   .then(()=>{
     res.status(200).json({message:'send like completely.'});
   })
   .catch(err=>{
    res.status(500).json({message:'Error Ocured!'});
   })
  



}

 ,
 async GetPost(req, res){
    
      await Post.findOne({_id: req.params.id}).populate('user').populate('comments.userId').
      then((post)=>{
          res.status(200).json({message:'Post Found', post});
      }).catch(err=> 
         res.status(404).json({message:'Post Found'})
         )
 },
 async LikeNotification(req, res){

      console.log(req.body.id);
      const dateValue = moment().format('YYYY-MM-DD');

          await User.updateOne(

            {
                  _id: req.body.id,
    
                },
                {
                  $push: {
                    notifications: {
                      senderId: req.user._id,
                      message: `${req.user.username} liked your post.`,
                      created: Date.now(),
                      date: dateValue,
                      viewProfile: false
                    }
                  }
                }).then(()=>{

                  res.status(200).json({message:'Send like notification completely.'});

                }).catch((err)=>{
                  res.status(500).json({message:'Error occured!'});
                })

 },
  async CommentNotification(req, res){

       console.log(req.body.id);

       await User.updateOne({
            _id:req.body.id
       },{

         $push: {
            notifications: {
              senderId: req.user._id,
              message: `${req.user.username} comment your post.`,
              created: Date.now(),
              postId:req.body.pid,
              viewProfile: false
            }
          }

       }).then(()=>{

         res.status(200).json({message:'Send comment notification completely.'});

       }).catch((err)=>{
         res.status(500).json({message:'Error occured!'});
       })

 }
}