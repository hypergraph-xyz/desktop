import React, { useState, useEffect } from 'react'
import { Title, StickyRow, TopRow } from '../layout/grid'
import { useParams } from 'react-router-dom'
import Content from '../content/content'

const ProfileContent = ({ p2p }) => {
  const { profileKey, contentKey } = useParams()
  const [profile, setProfile] = useState()
  const [content, setContent] = useState()

  useEffect(() => {
    ;(async () => {
      setProfile(await p2p.get(profileKey))
    })()
  }, [profileKey])

  useEffect(() => {
    ;(async () => {
      setContent(await p2p.get(contentKey))
    })()
  }, [contentKey])

  return profile && content ? (
    <>
      <TopRow>
        <Title>{profile.rawJSON.title}</Title>
      </TopRow>
      {content && (
        <Content
          p2p={p2p}
          content={content}
          profile={profile}
          renderRow={children => (
            <StickyRow top='116px' noBorderTop>
              {children}
            </StickyRow>
          )}
        />
      )}
    </>
  ) : null
}

export default ProfileContent
