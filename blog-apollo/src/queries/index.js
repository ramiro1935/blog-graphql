import { gql } from '@apollo/client'

export const GET_ALL_GENRES = gql`
  query {
    allGenres
  }
`

export const GET_ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`

export const BOOK = gql`
  fragment BookDetail on Book {
    title
    author {
      name
    }
    published
    genres
  }
`

export const GET_ALL_BOOKS = gql`
  ${BOOK}
  query allBooks($genre: String) {
    allBooks(genre: $genre) {
      ...BookDetail
    }
  }
`
export const BOOK_ADDED = gql`
  ${BOOK}
  subscription {
    bookAdded {
      ...BookDetail
    }
  }
`

export const CREATE_BOOK = gql`
  ${BOOK}
  mutation addBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String]
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      ...BookDetail
    }
  }
`

export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`
export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

export const GET_USER = gql`
  query {
    me {
      favoriteGenre
    }
  }
`
