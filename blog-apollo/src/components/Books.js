import React from 'react'

const BookTitle = ({ title, description, textBold }) => (
  <div>
    <h2>{title}</h2>
    <p>
      {description} <b>{textBold}</b>
    </p>
  </div>
)

const Books = ({
  show,
  books,
  title = '',
  description = '',
  textBold = '',
}) => {
  if (!show) {
    return null
  }

  return (
    <div>
      <BookTitle title={title} textBold={textBold} description={description} />
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map(a => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author?.name ?? ''}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
