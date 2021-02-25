import React, { useEffect, useContext } from 'react'
import { TopRow, Title } from '../layout/grid'
import { ipcRenderer } from 'electron'
import { encode } from 'dat-encoding'
import { useHistory, useParams } from 'react-router-dom'
import { ProfileContext } from '../../lib/context'
import { archiveModule } from '../../lib/vault'
import EditForm from './edit-form'

const Create = ({ p2p }) => {
  const history = useHistory()
  const { parentUrl } = useParams()
  const { url: profileUrl } = useContext(ProfileContext)

  useEffect(() => {
    document.documentElement.scrollTop = 0
  }, [])

  return (
    <>
      <TopRow>
        <Title>Add Content</Title>
      </TopRow>
      <EditForm
        p2p={p2p}
        parentUrl={parentUrl}
        onSubmit={async ({
          subtype,
          files,
          main,
          title,
          description,
          isRegister,
          parent,
          authors
        }) => {
          let {
            rawJSON: { url },
            metadata: { version }
          } = await p2p.init({
            type: 'content',
            subtype,
            title,
            description,
            authors,
            parents: parent
          })

          for (const [source] of Object.entries(files)) {
            await p2p.addFiles(url, source)
          }
          if (main) {
            ;({
              metadata: { version }
            } = await p2p.set({ url, main }))
          }
          if (isRegister) {
            await p2p.register(`${encode(url)}+${version}`, profileUrl)
            if (await ipcRenderer.invoke('getStoreValue', 'vault')) {
              await archiveModule(`${url}+${version}`)
            }
            history.push(
              `/profiles/${encode(profileUrl)}/${encode(url)}/${version}`
            )
          } else {
            history.push(`/drafts/${encode(url)}`)
          }
        }}
      />
    </>
  )
}

export default Create
