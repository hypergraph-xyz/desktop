import React, { useState, useEffect, useContext } from 'react'
import { TopRow, Title } from '../layout/grid'
import ContentRow from '../content/row'
import { encode } from 'dat-encoding'
import Footer from '../footer/footer'
import { ProfileContext } from '../../lib/context'
import sort from '../../lib/sort'

export default ({ p2p }) => {
  const [contents, setContents] = useState()
  const { url: profileUrl } = useContext(ProfileContext)

  useEffect(() => {
    ;(async () => {
      const profile = await p2p.get(profileUrl)
      const follows = await Promise.all(
        profile.rawJSON.follows.map(url => p2p.clone(encode(url)))
      )
      const profiles = [profile, ...follows]
      const contents = await Promise.all(
        profiles.map(profile =>
          Promise.all(
            profile.rawJSON.contents.map(url => {
              const [key, version] = url.split('+')
              return p2p.clone(encode(key), version)
            })
          )
        )
      )
      setContents(contents.flat().sort(sort))
    })()
  }, [])

  return (
    <>
      <TopRow>
        <Title>Feed</Title>
      </TopRow>
      {contents && (
        <>
          {contents.map(content => {
            return (
              <ContentRow
                key={content.rawJSON.url}
                p2p={p2p}
                content={content}
                to={`/contents/${encode(content.rawJSON.url)}/${
                  content.metadata.version
                }`}
              />
            )
          })}
          <Footer
            title={
              <>
                {contents.length
                  ? 'You’ve reached the end! ✌️'
                  : 'Share content or follow someone to fill up your feed 🙌'}
              </>
            }
          />
        </>
      )}
    </>
  )
}
