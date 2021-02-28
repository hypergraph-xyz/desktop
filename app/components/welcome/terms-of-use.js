import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { shell } from 'electron'
import { colors } from '@libscie/design-library'
import { promises as fs } from 'fs'
import ReactMarkdown from 'react-markdown'

const Container = styled.div`
  overflow: auto;
  position: absolute;
  bottom: 8rem;
  top: 2rem;
  right: 2rem;
  left: 2rem;
  padding-right: 1rem;

  h1 {
    font-weight: normal;
    font-size: 2.5rem;
    margin-bottom: 0;
  }
  header h1 {
    margin-top: 0;
  }
  a {
    color: ${colors.white};
    text-decoration: none;
    border-bottom: 2px solid ${colors.purple500};
    :hover {
      background-color: ${colors.purple500};
      cursor: pointer;
    }
  }
  ul {
    margin: 0;
  }

  .table_of_contents-indent-1 {
    margin-left: 1rem;
  }
`

export default () => {
  const [terms, setTerms] = useState()

  useEffect(() => {
    ;(async () => {
      setTerms(await (await fs.readFile('./build/terms.md')).toString())
    })()
  })
  return (
    <Container
      onClick={ev => {
        if (
          ev.target.tagName === 'A' &&
          !ev.target.getAttribute('href').startsWith('#')
        ) {
          shell.openExternal(ev.target.getAttribute('href'))
          ev.preventDefault()
        }
      }}
    >
      <ReactMarkdown
        // plugins={[gfm, math]}
        children={terms}
        linkTarget='noopener noreferrer'
      />
    </Container>
  )
}
