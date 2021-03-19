const _ = require('lodash')

const blogsRouter = require('../controllers/blogs')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    reducer = (s, p ) => {
        return s + p
    }
    return blogs.map(blog => blog.likes).reduce(reducer)
}


const favoriteBlog = (blogs) => {
    return blogs.find(blog => {
        return blog.likes === Math.max(...blogs.map(b => b.likes))
    })
}

const mostBlogs = (blogs) => {
    const authorBlogs = _.reduce(blogs, (result, next) => {
        result[next.author] = (result[next.author] || 0 ) + 1 
        return result
    }, {})

    let authorBlogsArray = []
    
    _.forIn(authorBlogs, (value, key) => {
        authorBlogsArray.push({author : key, blogs: value})        
    })
    
    return _.max(authorBlogsArray, 'blogs')
}

const mostLikes = (blogs) => {
    const authorBlogs = _.reduce(blogs, (result, next) => {
        result[next.author] = (result[next.author] || 0 ) + next.likes
        return result
    }, {})
    let authorBlogsArray = []
    
    _.forIn(authorBlogs, (value, key) => {
        authorBlogsArray.push({author : key, likes: value})        
    })
    
    return _.max(authorBlogsArray, 'likes')
}

module.exports = {
	dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}
