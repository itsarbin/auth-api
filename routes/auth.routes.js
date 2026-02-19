const express = require('express'); 
const authRouter = express.Router();
const userModel = require('../model/user.model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

authRouter.post('/register', async (req, res)=>{
    const {name, email, password} = req.body;

    const exsistingUser = await userModel.findOne({email});

    if(exsistingUser){
        return res.status(409).json({
            message: 'Email already exists' 
        })
    }


    const user = await userModel.create({
        name,
        email,
        password:crypto.createHash('sha256').update(password).digest('hex') 
    })



    const token = jwt.sign({id: user._id}, process.env.jwt_secret, {expiresIn: '1h'})

    res.cookie('token', token)
    res.status(201).json({
        message: 'User registered successfully',
        user:{
            name: user.name,
            email: user.email
        },
        token
    })
})

authRouter.post('/get-me',async (req, res)=>{

    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.jwt_secret);
    const user = await userModel.findById(decoded.id);

    res.json({
        name: user.name,
        email: user.email
    })

})

authRouter.post('/login',async (req, res)=>{
    const {email, password} = req.body;

    const user = await userModel.findOne({email});

    if(!user){
        return res.status(404).json({
            message: 'User not found'
        })
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    if(user.password !== hashedPassword){
        return res.status(401).json({
            message: 'Invalid password'
        })
    }

    const token = jwt.sign({id: user._id}, process.env.jwt_secret, {expiresIn: '1h'})

    res.cookie('token', token);

    res.status(201).json({
        message: 'User logged in successfully',
        user:{
            name: user.name,
            email: user.email
        },
        token
    })

   
})

 

module.exports = authRouter;