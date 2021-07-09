import { useMutation } from '@apollo/client'
import React, { useState } from 'react'
import Select from 'react-select'
import { EDIT_AUTHOR, GET_ALL_AUTHORS } from '../queries'

const EditBook = ({ show, setError, authors }) => {
  const [born, setBorn] = useState('')
  const [authorSelect, setAuthorSelect] = useState(null)
  const [updateAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: GET_ALL_AUTHORS }],
  })
  if (!show) {
    return null
  }

  const editAuthor = e => {
    e.preventDefault()
    updateAuthor({
      variables: { name: authorSelect.value, setBornTo: parseInt(born) },
    })
    setBorn('')
  }

  const options = authors.map(opt => ({ value: opt.name, label: opt.name }))

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={editAuthor}>
        <Select
          value={authorSelect}
          onChange={setAuthorSelect}
          options={options}
        />
        <input
          type='number'
          value={born}
          onChange={({ target }) => setBorn(target.value)}
        />
        <input type='submit' value={'update author'} />
      </form>
    </div>
  )
}

export default EditBook
