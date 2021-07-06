const { ApolloServer, UserInputError, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Book = require('./models/book')
const User = require('./models/user')
const Author = require('./models/author')

const MONGODB_URI =
  'mongodb://localhost:27017/blog-app?readPreference=primary&appname=MongoDB%20Compass&ssl=false'

const JSON_SECRET = 'JSON_SECRET'
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Author {
    name: String!
    bookCount: Int!
    born: Int
    id: ID!
  }
  type User {
    username: String!
  }
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String]
    id: ID!
  }
  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String]
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
    login(username: String!, password: String!): Token!
    addUser(username: String!): User!
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: (root, args) => {
      /*let booksAtEnd = [...books]
      if (!args.author && !args.genre) return books
      if (args.author)
        booksAtEnd = booksAtEnd.filter(b => b.author === args.author)
      if (args.genre)
        booksAtEnd = booksAtEnd.filter(b => b.genres.includes(args.genre))
      return booksAtEnd*/
      return Book.find({}).populate('author')
    },
    allAuthors: () => Author.find({}),
  },
  Author: {
    bookCount: root => books.filter(b => b.author === root.name).length,
  },
  Mutation: {
    addBook: async (root, args) => {
      const book = await Book.find({})
      const bookExistInDb = book.map(b => b.title).includes(args.title)
      if (bookExistInDb) throw new UserInputError('Title must be unique')

      const newBook = await new Book({ ...args })
      let author = await Author.findOne({ name: args.author })
      if (!author) {
        author = new Author({ name: args.author })
        await author.save()
      }
      newBook.author = author
      await newBook.save()
      return newBook
    },
    addUser: async (root, args) => {
      const newUser = new User({ ...args })
      try {
        await newUser.save()
      } catch (error) {
        throw new UserInputError(error.message)
      }
      return newUser
    },
    editAuthor: async (root, args) => {
      if (!args.name || !args.setBornTo) return null
      const author = await Author.findOne({ name: args.name })
      if (!author) throw new UserInputError('author does not exist')
      author.born = args.setBornTo
      await author.save()
      return author
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'secret')
        throw new UserInputError('credentials are invalid')

      const tokenData = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(tokenData, JSON_SECRET) }
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substrings(7), JSON_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  },
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
