import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Anchor from '../anchor'
import isContentRegistered from '../../lib/is-content-registered'
import { encode } from 'dat-encoding'

const AuthorWithoutContentRegistration = styled.span`
  margin: 0;
  display: inline-block;
  padding-bottom: 2px;
`

const Author = ({ p2p, url, content, Loading }) => {
  const [name, setName] = useState()
  const [isRegistered, setIsRegistered] = useState(false)
  const [isUnavailable, setIsUnavailable] = useState(false)

  useEffect(() => {
    ;(async () => {
      const clonePromise = p2p.clone(url)
      setTimeout(() => {
        clonePromise.cancel('Timeout')
      }, 5000)

      let profile
      try {
        profile = await clonePromise
      } catch (_) {}

      if (profile) {
        setName(profile.rawJSON.title)
        setIsRegistered(isContentRegistered(content, profile))
      } else {
        setIsUnavailable(true)
      }
    })()
  }, [url])

  return isUnavailable ? (
    'Author unavailable'
  ) : !name ? (
    <Loading style={{ display: 'inline', verticalAlign: 'top' }} />
  ) : isRegistered ? (
    <Link component={Anchor} to={`/profiles/${encode(url)}`}>
      {name}
    </Link>
  ) : (
    <AuthorWithoutContentRegistration key={url}>
      {name}
    </AuthorWithoutContentRegistration>
  )
}

export default Author
