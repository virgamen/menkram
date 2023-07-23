
const Message = require('../models/messageModel');
const Conversation = require('../models/conversationModel');
const User = require('../models/userModels');
const Helpers = require('../Helpers/helpers');


module.exports = {

    async GetAllMessages(req, res) {
        const { sender_Id, receiver_Id } = req.params;
        const conversation = await Conversation.findOne({
          $or: [
            {
              $and: [
                { 'participants.senderId': sender_Id },
                { 'participants.receiverId': receiver_Id }
              ]
            },
            {
              $and: [
                { 'participants.senderId': receiver_Id },
                { 'participants.receiverId': sender_Id }
              ]
            }
          ]
        }).select('_id');
    
        if (conversation) {
          const messages = await Message.findOne({
            conversationId: conversation._id
          });
          res
            .status(200)
            .json({ message: 'Messages returned', messages });
        }
      },
    

    SendMessage(req,res){


        //console.log(req.body);
        const {sender_Id, receiver_Id} = req.params;

        // Conversation.find({
        //     $or: [
        //         {
        //         participants: {$elemMatch: {senderId: sender_Id, receiverId: receiver_Id }},
        //         participants: {$elemMatch: {senderId: receiver_Id, receiverId: sender_Id }}
        //     }
        // ]
        // }, async(err, result) =>{
        //      if(result.length > 0){

        //      }else{
        //         const NewConversation = new Conversation();
        //         NewConversation.participants.push({
        //             senderId: req.user._id,
        //             receiverId: req.params.receiver_Id
        //         });

        //         const saveConversation = await NewConversation.save();

        //         console.log(saveConversation);

        //      }
        // })


        Conversation.find({
            $or: [
                {
                  participants: {
                    $elemMatch: { senderId: sender_Id, receiverId: receiver_Id }
                  }
                },
                {
                  participants: {
                    $elemMatch: { senderId: receiver_Id, receiverId: sender_Id }
                  }
                }
              ]
        }).then(async result => {

            //console.log(result);


            if(result.length > 0){

             const msg = await Message.findOne({
              conversationId: result[0]._id
             });
             Helpers.updateChatList(req, msg);

                await Message.updateOne({
                    conversationId: result[0]._id
                },{
                    $push: {
                        message: {

                            senderId: req.user._id,
                            receiverId: req.params.receiver_Id,
                            sendername: req.user.username,
                            receivername: req.body.receivername,
                            body: req.body.message,

                        }
                    }
                }).then(()=>{
                    res.status(200).json({message:'Message Sent Successfully.'})
                }).catch(err=>{

                    res.status(500).json({message:'Error Occured!'})

                })

                     }else{
                        const NewConversation = new Conversation();
                        NewConversation.participants.push({
                            senderId: req.user._id,
                            receiverId: req.params.receiver_Id
                        });
        
                        const saveConversation = await NewConversation.save();
        
                        const newMessage = new Message();

                        newMessage.conversationId = saveConversation._id;
                        newMessage.sender = req.user.username;
                        newMessage.receiver = req.body.receivername;
                        newMessage.message.push({

                            senderId: req.user._id,
                            receiverId: req.params.receiver_Id,
                            sendername: req.user.username,
                            receivername: req.body.receivername,
                            body: req.body.message,



                        });

                        const saveMessage = await newMessage.save();

                        console.log(saveMessage);

                        //User 1

                        await User.updateOne({
                            _id: req.user._id,
                        },{
                             $push:{
                                chatList: {
                                    $each: [
                                        {
                                            receiverId: req.params.receiver_Id,
                                            msgId: newMessage._id
                                        }
                                    ],
                                    $position:0
                                }
                             }

                        })

                        ///User 2
                        await User.updateOne({
                            _id: req.params.receiver_Id,
                        },{
                             $push:{
                                chatList: {
                                    $each: [
                                        {
                                            receiverId: req.user._id,
                                            msgId: newMessage._id
                                        }
                                    ],
                                    $position:0
                                }
                             }

                        })


                        await newMessage.save().then(()=>{
                            res.status(200).json({message:'Message Sent'})
                        }).catch(err=>{

                            res.status(500).json({message:'Error Occured!'})

                        })
        
                     }


        }).catch(err=>{

            console.log(err);

        })




    },
    async MarkReceiverMessages(req,res){
      const {sender, receiver} = req.params;
      const msg = await Message.aggregate([
        {
          $unwind: '$message'
        },
         {
           $match: {
            $and: [{
              'message.sendername': receiver, 'message.receivername': sender
            }]
           }
         }
      ]);

      if(msg.length > 0){
         try{

            msg.forEach( async value => {
                 await Message.updateOne({
                   'message._id': value.message._id,
                 },{
                  $set: {'message.$.isRead': true}
                 })
            });
            res.status(200).json({message:'Send as read'});
         }catch(err){
          res.status(500).json({message:'Error Occured!'});
         }
      }

  

    },
    async MarkAllMessages(req,res){
      const {sender, receiver} = req.params;
      const msg = await Message.aggregate([
         {  $match: {
          'message.receivername': req.user.username
        }},
        {$unwind:'$message'},
        {  $match: {
          'message.receivername': req.user.username
        }}
      ]);

      //console.log(msg);

      if(msg.length > 0){
         try{

            msg.forEach( async value => {
                 await Message.updateOne({
                   'message._id': value.message._id,
                 },{
                  $set: {'message.$.isRead': true}
                 })
            });
            res.status(200).json({message:'Send as read'});
         }catch(err){
          res.status(500).json({message:'Error Occured!'});
         }
      }

  

    }
}