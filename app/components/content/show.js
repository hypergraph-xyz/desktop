import React from 'react'
import { TopRow } from '../layout/grid'
import { useParams } from 'react-router-dom'
import Content from './content'

const ShowContent = ({ p2p }) => {
  const { key, version } = useParams()

  return (
    <Content
      p2p={p2p}
      contentKey={key}
      version={version}
      renderRow={children => <TopRow>{children}</TopRow>}
    />
  )
}

export default ShowContent
