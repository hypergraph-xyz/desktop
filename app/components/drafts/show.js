import React, { useState, useEffect } from 'react'
import { TopRow } from '../layout/grid'
import { useParams } from 'react-router-dom'
import Content from '../content/content'

const ShowDraft = ({ p2p }) => {
  const { key } = useParams()
  const [content, setContent] = useState()

  useEffect(() => {
    ;(async () => {
      setContent(await p2p.get(key))
    })()
  }, [key])

  return content ? (
    <Content
      p2p={p2p}
      content={content}
      renderRow={children => <TopRow>{children}</TopRow>}
    />
  ) : null
}

export default ShowDraft
