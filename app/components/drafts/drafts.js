import React, { useState, useEffect, useContext } from 'react'
import { TopRow, Title } from '../layout/grid'
import ContentRow from '../content/row'
import { encode } from 'dat-encoding'
import Footer, { FooterAddContent } from '../footer/footer'
import isContentRegistered from '../../lib/is-content-registered'
import { ProfileContext } from '../../lib/context'
import sort from '../../lib/sort'

export default ({ p2p }) => {
  const [drafts, setDrafts] = useState()
  const [hasRegisteredContent, setHasRegisteredContent] = useState()
  const { url: profileUrl } = useContext(ProfileContext)

  useEffect(() => {
    ;(async () => {
      const [profile, contents] = await Promise.all([
        p2p.get(profileUrl),
        p2p.listContent()
      ])
      setHasRegisteredContent(profile.rawJSON.contents.length)
      const drafts = contents
        .filter(content => content.metadata.isWritable)
        .filter(content => !isContentRegistered(content, profile))
        .sort(sort)
      setDrafts(drafts)
    })()
  }, [])

  return (
    <>
      <TopRow>
        <Title>Drafts</Title>
      </TopRow>
      {drafts && (
        <>
          {drafts.map(draft => {
            return (
              <ContentRow
                key={draft.rawJSON.url}
                p2p={p2p}
                content={draft}
                to={`/drafts/${encode(draft.rawJSON.url)}`}
              />
            )
          })}
          <Footer
            title={
              <>
                {drafts.length ? (
                  'You’ve reached the end! ✌️'
                ) : hasRegisteredContent ? (
                  <>No drafts! All your work is now on your profile 😎</>
                ) : (
                  <>
                    Nothing here yet! Click <FooterAddContent /> to get started
                  </>
                )}
              </>
            }
          />
        </>
      )}
    </>
  )
}
