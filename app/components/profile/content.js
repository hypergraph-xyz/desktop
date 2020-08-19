import React, { useState, useEffect } from 'react'
import { Title, StickyRow, TopRow } from '../layout/grid'
import { useParams } from 'react-router-dom'
import Content from '../content/content'

const ProfileContent = ({ p2p }) => {
  const { profileKey, contentKey, version } = useParams()
  const [profile, setProfile] = useState()

  useEffect(() => {
    ;(async () => {
      setProfile(await p2p.get(profileKey))
    })()
  }, [profileKey])

  return profile ? (
    <>
      <TopRow>
        <Title>{profile.rawJSON.title}</Title>
      </TopRow>
      <Content
        p2p={p2p}
        contentKey={contentKey}
        version={version}
        renderRow={children => (
          <StickyRow top='116px' noBorderTop>
            {children}
          </StickyRow>
        )}
      />
    </>
  ) : null
}

export default ProfileContent
