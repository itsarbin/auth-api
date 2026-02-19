const express = require('express');
const userModel = require('../model/user.model')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const authRouter = express.Router();

authRouter.post('/register',async (req,res)=>{
    const {name,email,password} = req.body;

    const existingUser = await userModel.findOne({email})

    if(existingUser){
        return res.status(401).json({
            message:'Email already exists'
        })
    }

    const hashedPassword = crypto.createHash('md5').update(password).digest('hex')



    const user = await userModel.create({
        name,
        email,
        password: hashedPassword
    })

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

    res.cookie('token',token)

    res.status(201).json({
        message:'User registered successfully',
        user,
        token
    })
})

authRouter.post('/login', async (req,res)=>{
    const {email,password} = req.body;

    const user = await userModel.findOne({email});

    if(!user){
        return res.status(401).json({
            message:'Invalid email'
        })
    }

    const isPasswordValid = user.password === crypto.createHash('md5').update(password).digest('hex');

    if(!isPasswordValid){
        return res.status(401).json({
            message:'Invalid password'
        })
    }

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET);
    res.cookie('token',token)

    res.status(200).json({
        message:'Login successful',
        user,
        token
    })
})
    

    







module.exports = authRouter;