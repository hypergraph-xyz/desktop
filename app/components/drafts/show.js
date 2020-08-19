import React from 'react'
import { TopRow } from '../layout/grid'
import { useParams } from 'react-router-dom'
import Content from '../content/content'

const ShowDraft = ({ p2p }) => {
  const { key } = useParams()

  return (
    <Content
      p2p={p2p}
      contentKey={key}
      renderRow={children => <TopRow>{children}</TopRow>}
    />
  )
}

export default ShowDraft
