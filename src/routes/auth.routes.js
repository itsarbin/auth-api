const express = require('express');
const userModel = require('../model/user.model')
const jwt = require('jsonwebtoken')

const authRouter = express.Router();

authRouter.post('/register',async (req,res)=>{
    const {name,email,password} = req.body;

    const existingUser = await userModel.findOne({email})

    if(existingUser){
        return res.status(401).json({
            message:'Email already exists'
        })
    }



    const user = await userModel.create({
        name,
        email,
        password
    })

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

    res.cookie('token',token)

    res.status(201).json({
        message:'User registered successfully',
        user,
        token
    })
})
    

    







module.exports = authRouter;