import React from 'react'

const FilterGenres = ({ show, genres, setFilter }) => {
  if (!show) return null
  return (
    <div>
      {genres &&
        genres.map(g => (
          <button onClick={() => setFilter(g)} key={g}>
            {g}
          </button>
        ))}
    </div>
  )
}

export default FilterGenres
