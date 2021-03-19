const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })
  await user.save()
  const userToLog = await User.findOne({username: 'root'})
  const blogObject = helper.initialBlogs.map(blog => new Blog({...blog, user : userToLog._id}))
  const promiseArray = blogObject.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const contents = response.body.map(r => r.title)

    expect(contents).toContain(
      'test title 2'
    )
  })
})

describe('viewing a specific blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
      
    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))

    expect(resultBlog.body).toEqual(processedBlogToView)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    console.log(validNonexistingId)

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

describe('addition of a new blog', () => {
  test('fail to add blog with invalid token', async () => {

    const newBlog = {
      title: 'asdf',
      author: 'Jayson',
      url: 'url',
      likes: 10
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', 'bearer asdfsdf')
      .send(newBlog)
      .expect(401)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('succeeds with valid data', async () => {
    const usersAtStart = await User.find({})
    userToSign = {
      username: usersAtStart[0].username,
      id: usersAtStart[0]._id
    }
    const token = jwt.sign(userToSign, process.env.SECRET)

    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'Jayson',
      url: 'url',
      likes: 10
    }

    await api
      .post('/api/blogs')
      .set('Authorization', 'bearer ' + token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)


    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map(n => n.title)
    expect(contents).toContain(
      'async/await simplifies making async calls'
    )
  })

  test('fails with status code 400 if data invaild', async () => {
    const usersAtStart = await User.find({})
    userToSign = {
      username: usersAtStart[0].username,
      id: usersAtStart[0]._id
    }
    const token = jwt.sign(userToSign, process.env.SECRET)
    const blogsAtStart = await helper.blogsInDb()
    const newBlog = {
      author: 's'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', 'bearer ' + token)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })

  test('verifies that the unique identifier property of the blog posts is named id', async () => {
    const usersAtStart = await User.find({})
    userToSign = {
      username: usersAtStart[0].username,
      id: usersAtStart[0]._id
    }
    const token = jwt.sign(userToSign, process.env.SECRET)
    const newBlog = {
      title: 'test identity',
      author: '1asa',
      url: 'rusl',
      likes: 10
    }

    await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + token)
        .send(newBlog)
        .expect(201)
    const blogsAtEnd = await helper.blogsInDb()
    const findAddedBlog = blogsAtEnd.find(b => b.title === 'test identity')
    expect(findAddedBlog.id).toBeDefined()

  })

  test('likes will set to 0 if undefined in the request', async () => {
    const usersAtStart = await User.find({})
    userToSign = {
      username: usersAtStart[0].username,
      id: usersAtStart[0]._id
    }
    const token = jwt.sign(userToSign, process.env.SECRET)
    const newBlog = {
      title: 'undefined likes',
      author: '1aa',
      url: 'rul'
    }

    await api
        .post('/api/blogs')
        .set('Authorization', 'bearer ' + token)
        .send(newBlog)
        .expect(201)
    const blogsAtEnd = await helper.blogsInDb()
    const findAddedBlog = blogsAtEnd.find(b => b.title === 'undefined likes')
    expect(findAddedBlog.likes).toBe(0)
  })

})

describe('deletion of a blog', () => {

  test('failed with status code 401 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', 'bearer ' + 'asdf')
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length
    )
  })

  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    const usersAtStart = await User.find({})
    userToSign = {
      username: usersAtStart[0].username,
      id: usersAtStart[0]._id
    }
    const token = jwt.sign(userToSign, process.env.SECRET)

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', 'bearer ' + token)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const contents = blogsAtEnd.map(r => r.title)

    expect(contents).not.toContain(blogToDelete.title)
  })

  
})

describe('update of a blog', () => {
  test('updated the blog to requested info', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const newBlog = {
      likes: 100
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd[0].likes).toBe(100)

  })
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
      blogs: []
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
  
  test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
      }
  
      const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
      expect(result.body.error).toContain('`username` to be unique')
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username is less than 3 characters', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
      username: 'ro',
      name: 'Superuser',
      password: 'salainen',
      }
  
      await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password is less than 3 characters', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
      username: 'raao',
      name: 'Superuser',
      password: 'as',
      }
  
      await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})