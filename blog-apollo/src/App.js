import {
  useApolloClient,
  useLazyQuery,
  useQuery,
  useSubscription,
} from '@apollo/client'
import React, { useEffect, useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import EditBook from './components/EditBook'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Filter from './components/FilterGenres'
import {
  BOOK_ADDED,
  GET_ALL_AUTHORS,
  GET_ALL_BOOKS,
  GET_ALL_GENRES,
  GET_USER,
} from './queries'

const Notification = ({ message }) => {
  if (!message) return null
  return <div style={{ color: 'red' }}>{message}</div>
}

const defaultTitle = 'Books'
const defaultDescription = 'in genre'
const App = () => {
  const [page, setPage] = useState('authors')
  const [error, setError] = useState(null)
  const [token, setToken] = useState(null)
  const [booksWithFilter, setBooksWithFilter] = useState([])
  const [title, setTitle] = useState(defaultTitle)
  const [description, setDescription] = useState(defaultDescription)
  const [filter, setFilter] = useState(null)
  const [filterActive, setFilterActive] = useState(false)
  const authors = useQuery(GET_ALL_AUTHORS)
  const books = useQuery(GET_ALL_BOOKS)

  const genres = useQuery(GET_ALL_GENRES)
  const user = useQuery(GET_USER)
  const [booksFiltered, result] = useLazyQuery(GET_ALL_BOOKS)
  const client = useApolloClient()

  useEffect(() => {
    if (result.data) {
      setBooksWithFilter(result.data.allBooks)
    }
  }, [result.data]) //eslint-disable-line

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      window.alert(JSON.stringify(addedBook))
      updateCacheWith(addedBook)
    },
  })

  if (authors.loading || books.loading) return <div>loading....</div>

  const dataAuthors = authors.data?.allAuthors ?? []
  const dataGenre = genres.data?.allGenres ?? []
  const dataUser = user.data?.me ?? null
  const dataBook =
    title === 'Recommended' && dataUser
      ? books.data?.allBooks?.filter(b =>
          b.genres.includes(dataUser.favoriteGenre)
        ) ?? []
      : books.data?.allBooks ?? []

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const onChangeFilter = filter => {
    setFilter(filter)
    booksFiltered({ variables: { genre: filter } })
  }

  const updateCacheWith = addedBook => {
    const includedIn = (set, object) => set.map(p => p.id).includes(object.id)
    const dataInStore = client.readQuery({ query: GET_ALL_BOOKS })
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: GET_ALL_BOOKS,
        data: { allBooks: dataInStore.allBooks.concat(addedBook) },
      })
    }
  }

  const viewBooks = type => {
    switch (type) {
      case 'recommended': {
        setTitle('Recommended')
        setDescription('books in your favorite genre')
        setFilter(dataUser?.favoriteGenre ?? '')
        setPage('books')
        setFilterActive(false)
        break
      }
      case 'books': {
        setTitle('Books')
        setDescription('in genre')
        setFilter('')
        setPage('books')
        setFilterActive(true)
        break
      }
      default:
        return null
    }
  }

  return (
    <div>
      <Notification message={error} />
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => viewBooks('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => viewBooks('recommended')}>
              recommended
            </button>
            <button onClick={() => logout()}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      <Authors show={page === 'authors'} authors={dataAuthors} />
      <EditBook
        authors={dataAuthors}
        show={page === 'authors'}
        setError={setError}
      />
      <Books
        show={page === 'books'}
        title={title}
        description={description}
        textBold={filter}
        books={filterActive ? booksWithFilter : dataBook}
      />
      <Filter
        show={filterActive && page === 'books'}
        genres={dataGenre}
        setFilter={onChangeFilter}
      />
      <NewBook show={page === 'add'} setError={setError} />
      <LoginForm
        show={page === 'login'}
        setToken={setToken}
        setError={setError}
      />
    </div>
  )
}

export default App
