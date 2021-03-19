const listHelper = require('../utils/list_helper')

const listWithMultipleBlog = [
    {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
        __v: 0
    },
    {
        _id: '5a422aa71b54a676234d2118',
        title: 'Go To Statement',
        author: 'Edsger W. Dijksstra AA',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 1,
        __v: 0
    },
    {
        _id: '5a422aa71b54a623534d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijksstra AABB',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 4,
        __v: 0
    },
    {
        _id: '5a422aa71b54aa76234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 1,
        __v: 0
    }
]

test('dummy returns one', () => {
    const blogs =[]
    const result = listHelper.dummy(blogs)
    expect(result).toBe(1)
})

describe('total likes', () => {
    const listWithOneBlog = [
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
        __v: 0
      }
    ]
  
    test('when list has only one blog, equals the likes of that', () => {
      const result = listHelper.totalLikes(listWithOneBlog)
      expect(result).toBe(5)
    })

    
    test('multiple logs', () => {
        const result = listHelper.totalLikes(listWithMultipleBlog)
        expect(result).toBe(11)
    })
  })

 
    test('favorite blog', () => {
        const result = listHelper.favoriteBlog(listWithMultipleBlog)
        expect(result).toEqual({
            _id: '5a422aa71b54a676234d17f8',
            title: 'Go To Statement Considered Harmful',
            author: 'Edsger W. Dijkstra',
            url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
            likes: 5,
            __v: 0
        })
    })

    test('author with the most blogs', () => {
        const result = listHelper.mostBlogs(listWithMultipleBlog)
        expect(result).toEqual(
            {
                author: 'Edsger W. Dijkstra',
                blogs: 2
            }
        )
    })
    
    test('author with the most likes blogs', () => {
        const result = listHelper.mostLikes(listWithMultipleBlog)
        expect(result).toEqual(
            {
                author: 'Edsger W. Dijkstra',
                likes: 6
            }
        )
    })

