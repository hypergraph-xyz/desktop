import React, { useState, useEffect } from 'react'
import { TopRow, Title } from '../layout/grid'
import ContentRow from '../content/row'
import { encode } from 'dat-encoding'
import Footer, { FooterAddContent, FooterSearch } from '../footer/footer'
import fetch from 'node-fetch'
import Loading, { LoadingFlex } from '../loading/loading'
import { cloneMany } from '../../lib/clone-contents'
import { vaultUrl } from '../../lib/vault'

export default ({ p2p }) => {
  const [contents, setContents] = useState()
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    ;(async () => {
      let res
      try {
        res = await fetch(`${vaultUrl}/api/discover`)
      } catch (_) {
        setIsOffline(true)
        return
      }
      const urls = (await res.json()).filter(url => Boolean(url.split('+')[1]))
      const contents = await cloneMany({ p2p, urls })
      setContents(contents)
    })()
  }, [])

  return (
    <>
      <TopRow>
        <Title>Discover</Title>
      </TopRow>
      {isOffline ? (
        <Footer title='Only available when connected to the Internet ☝' />
      ) : contents ? (
        <>
          {contents.map(content => {
            return content.rawJSON.title ? (
              <ContentRow
                key={`${content.rawJSON.url}+${content.metadata.version}`}
                p2p={p2p}
                content={content}
                to={`/contents/${encode(content.rawJSON.url)}/${
                  content.metadata.version
                }`}
                isRegistered
              />
            ) : (
              <ContentRow
                key={`${content.rawJSON.url}+${content.metadata.version}`}
              />
            )
          })}
          <Footer
            title={
              <>
                {contents.length ? (
                  'You’ve reached the end! ✌️'
                ) : (
                  <>
                    Add content <FooterAddContent /> or <FooterSearch /> Find
                    someone to follow
                  </>
                )}
              </>
            }
          />
        </>
      ) : (
        <LoadingFlex>
          <Loading />
        </LoadingFlex>
      )}
    </>
  )
}
