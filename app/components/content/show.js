import React, { useState, useEffect } from 'react'
import { TopRow } from '../layout/grid'
import { useParams } from 'react-router-dom'
import Content from './content'
import { encode } from 'dat-encoding'

const ShowContent = ({ p2p }) => {
  const { key, version } = useParams()
  const [content, setContent] = useState()

  useEffect(() => {
    ;(async () => {
      setContent(await p2p.clone(encode(key), version))
    })()
  }, [key, version])

  return content ? (
    <Content
      p2p={p2p}
      content={content}
      renderRow={children => <TopRow>{children}</TopRow>}
    />
  ) : null
}

export default ShowContent
