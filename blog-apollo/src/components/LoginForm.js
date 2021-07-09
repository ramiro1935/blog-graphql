import { useMutation } from '@apollo/client'
import React, { useEffect, useState } from 'react'
import { LOGIN } from '../queries'

const LoginForm = ({ show, setToken, setError }) => {
  const [username, setName] = useState('')
  const [password, setPassword] = useState('')
  const [login, result] = useMutation(LOGIN, {
    onError: error => {
      setError(error.graphQLErrors[0].message)
    },
  })

  const handleLogin = e => {
    e.preventDefault()
    login({ variables: { username, password } })
    setName('')
    setPassword('')
  }

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('token', token)
    }
  }, [result.data]) //eslint-disable-line

  if (!show) return null
  return (
    <form onSubmit={handleLogin}>
      <div>
        name{' '}
        <input
          type='text'
          value={username}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div>
        password{' '}
        <input
          type='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>
      <div>
        <input type='submit' value='login' />
      </div>
    </form>
  )
}

export default LoginForm
