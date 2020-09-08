import React, { useEffect, useContext } from 'react'
import { TopRow, Title } from '../layout/grid'
import { remote, ipcRenderer } from 'electron'
import { promises as fs } from 'fs'
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
            parents: [parent].filter(Boolean)
          })

          const dir = `${remote.app.getPath('home')}/.p2pcommons/${encode(url)}`
          for (const [source, destination] of Object.entries(files)) {
            await fs.copyFile(source, `${dir}/${destination}`)
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
