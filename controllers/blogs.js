const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog
		.find({}).populate('user', { username: 1, name : 1, id: 1})
	response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
	const blog = await Blog
		.findById(request.params.id).populate('user', { username: 1, name : 1, id:1})
	if (blog) {
		response.json(blog)
	} else {
		response.status(404).end()
	}
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
	const body = request.body
	const user = request.user
	if (!user) {
		return response.status(401).json({ error: 'invalid authorization'})
	}
	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes ? body.likes : 0,
		comments: [],
		user: user._id
	})
	const savedBlog = await blog.save()
	user.blogs = user.blogs.concat(savedBlog._id)
	await user.save()

	response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
	const blog = await Blog.findById(request.params.id)
	const user = request.user
	if (!user || blog.user.toString() != user.id.toString()) {
		return response.status(401).json({ error: 'invalid token to delete the blog'})
	}
	await Blog.findByIdAndDelete(blog.id)
	user.blogs = user.blogs.filter(b => b.id !== blog.id)
	await user.save()
	response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
	const updatedBlog = await Blog
								.findByIdAndUpdate(request.params.id, request.body, { new: true })
								.populate('user', { username: 1, name : 1})
	response.json(updatedBlog)
})

module.exports = blogsRouter