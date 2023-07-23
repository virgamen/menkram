const User = require('../models/userModels');

module.exports = {

    FollowUser(req, res){
       const followUser = async ()=>{

          await User.updateOne({
             _id: req.user._id,
             "following.userFollowed":{$ne: req.body.userFollowed}
          },{
             $push: {
                 following:{
                     userFollowed: req.body.userFollowed
                 }
             }
          })


          await User.updateOne({
            _id: req.body.userFollowed,
            "following.follower":{$ne: req.user._id}
         },{
            $push: {
                followers:{
                    follower: req.user._id
                },
                notifications:{
                  senderId: req.user._id,
                  message: `${req.user.username} is now following you. `,
                  created: new Date(),
                  viewProfile: false,
                  
                }
            }
         })
         
       }

       followUser()
       .then(()=>{
         res.status(200).json({message:'Following user now!'});
       })
       .catch(err=>{
        res.status(500).json({message:'Error Ocured!'});
       })
    },


    unFollowUser(req, res){
        const unfollowUser = async ()=>{
 
           await User.updateOne({
              _id: req.user._id,
           },{
              $pull: {
                  following:{
                      userFollowed: req.body.userFollowed
                  }
              }
           })
 
 
           await User.updateOne({
             _id: req.body.userFollowed
          },{
             $pull: {
                 followers:{
                     follower: req.user._id
                 }
             }
          })
          
        }
 
        unfollowUser()
        .then(()=>{
          res.status(200).json({message:'Unfollow user now!'});
        })
        .catch(err=>{
         res.status(500).json({message:'Error Ocured!'});
        })
     },
     async markNotifications(req,res){
        console.log(req.body);
        if(!req.body.deleteValue){

          await User.updateOne({
             _id: req.user._id,
             'notifications._id': req.params.id
          }, {
             $set: {'notifications.$.read': true}
             
          }).then(()=>{
             res.status(200).json({message:'Mark as read'});
          }).catch(err=>{
             res.status(500).json({message:'Error Occured!'});
          })
          
        }else{

           await User.updateOne({
            _id: req.user._id,
            'notifications._id': req.params.id
           },{
             $pull:{
               notifications: { _id: req.params.id } 
               }
           }).then(()=>{
            res.status(200).json({message:'Deleted notifications'});
         }).catch(err=>{
            res.status(500).json({message:'Error Occured!'});
         })

        }
     },
    async markAllNotifications(req,res){
       await User.updateOne({
          _id: req.user._id
       },{
           $set:{ 'notifications.$[elem].read' : true }
       },{
          arrayFilters:[{'elem.read':false}], multi: true
       }).then(()=>{
         res.status(200).json({message:'Mark all as read'});
      }).catch(err=>{
         res.status(500).json({message:'Error Occured!'});
      })
     }
}