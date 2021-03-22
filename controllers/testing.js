const Blog = require('../models/blog')
const User = require('../models/user')
const resetRouter = require('express').Router()

resetRouter.post('/reset', async (request, response) => {
    await Blog.deleteMany({})
    await User.deleteMany({})
  
    response.status(204).end()
})

module.exports = resetRouter