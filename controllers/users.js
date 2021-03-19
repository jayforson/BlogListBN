const bcrypt = require('bcryptjs')
const { response } = require('express')
const { model } = require('mongoose')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1})
    response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const body = request.body
    
    if (body.password.length <= 3) {
        return response.status(400).send({ error: 'Password length less than 3'})
    } 

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)
    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash,
        blogs: []
    })
    const savedUser = await user.save()
    response.json(savedUser)
})

usersRouter.delete('/:id', async(request, response) => {
    const user = await User.findById(request.params.id)
    const blogPromises = user.blogs.map(b => Blog.findByIdAndDelete(b))
    await Promise.all(blogPromises)
    await User.findByIdAndDelete(request.params.id)
    response.status(204).end()
})


module.exports = usersRouter
