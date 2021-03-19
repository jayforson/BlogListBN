/* eslint-disable no-unused-vars */
const morgan = require('morgan')
const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


morgan.token('body', function(req, res) {
	return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

const requestLogger = morgan(function (tokens, req, res) {
	return [
		tokens.method(req, res),
		tokens.url(req, res),
		tokens.status(req, res),
		tokens.res(req, res, 'content-length'), '-',
		tokens['response-time'](req, res), 'ms',
		tokens.body(req, res)
	].join(' ')
})

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
	logger.error(error.message)

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message })
	} else if (error.name == 'JsonWebTokenError') {
		return response.status(401).json( { error: 'invalid token'})
	}
	next(error)
}

const userExtractor = async (request, response, next) => {
	const authorization = request.get('authorization')
	if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
		request.token = authorization.substring(7)
		
		const decodedToken = jwt.verify(request.token, process.env.SECRET)
		if (!decodedToken.id) {
			request.user = null
		} else {
			request.user = await User.findById(decodedToken.id)
		}
	}
	
	next()
}

module.exports = {
	requestLogger,
	unknownEndpoint,
	errorHandler,
	userExtractor
}
