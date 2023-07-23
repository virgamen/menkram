const Joi = require('joi');
//const HttpStatus = require('http-status-code');


const User = require('../models/userModels');

const Helpers = require('../Helpers/helpers');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbConfig = require('../config/secret');



module.exports = {

  

   async CreateUser(req, res){
        //console.log(req.body);

  

          const schema = Joi.object().keys({
             username: Joi.string().min(8).max(15).required(),
             name:Joi.string().required(),
             email: Joi.string().email().required(),
             password: Joi.string().min(8).required()

          });

          const {error, value} = schema.validate(req.body);

          console.log(value);
          //console.log(HttpStatus.BAD_REQUEST);

          if(error && error.details){
             return res.status(400).json({msg:error.details});
          }

          const userEmail = await User.findOne({email: Helpers.lowerCase(req.body.email)});
          if(userEmail){
            return res.status(409).json({message:'Email already exist!'});
          }

          const userName = await User.findOne({username: Helpers.firstUpper(req.body.username)});
          if(userName){
            return res.status(409).json({message:'Username already exist!'});
          }

          return bcrypt.hash(value.password,10,(err, hash)=>{

             if(err){

              return res.status(400).json({message:'Error hashing password'});

             }

              const body = {
                username: Helpers.firstUpper(value.username),
                name:Helpers.firstUpper(value.name),
                email: Helpers.lowerCase(value.email),
                password: hash
              }

              /// Save to DB
              User.create(body).then((user)=>{

                ///JWT 

                const token = jwt.sign({data:user}, dbConfig.secret, {
                   expiresIn: "1h"

                });

                 


                  res.cookie('auth', token);
                  
                  res.status(201).json({message:'User Create Successful', user, token});
              }).catch(err=>{
                res.status(500).json({message:'Error occured!'});
              })

          });

     },

    async loginUser(req, res){
        
          if(!req.body.username || !req.body.password){
            return res.status(500).json({message:'No empty field allowed!'});
          }

          await User.findOne({username: Helpers.firstUpper(req.body.username)}).then((user)=>{
            if(!user){
              return res.status(404).json({message:'Username not found!!'});
            }

            return bcrypt.compare(req.body.password, user.password).then((result)=>{
                if(!result){

                  return res.status(500).json({message:'Password incorrect!!!'});
                }

                  const token = jwt.sign({data:user}, dbConfig.secret, {
                    expiresIn: '1h'
                  });

                  //console.log(token);
                    
                     res.cookie('auth', token);
                 

                     return res.status(200).json({message:'Login Successful',user,token});

            });

          }).catch(err=>{
            return res.status(500).json({message:'Error occured!'});
          });

     }

}