import React, { useEffect, useContext, useState } from 'react'
import { TopRow, Title } from '../layout/grid'
import { ipcRenderer } from 'electron'
import { promises as fs } from 'fs'
import { encode } from 'dat-encoding'
import { useHistory, useParams } from 'react-router-dom'
import { ProfileContext } from '../../lib/context'
import EditForm from './edit-form'
import { archiveModule } from '../../lib/vault'

const Edit = ({ p2p }) => {
  const history = useHistory()
  const { url: profileUrl } = useContext(ProfileContext)
  const { key, version } = useParams()
  const [content, setContent] = useState()
  const [profile, setProfile] = useState()

  useEffect(() => {
    ;(async () => {
      const content = await p2p.clone(key, Number(version))
      setContent(content)
    })()
  }, [key, version])

  useEffect(() => {
    ;(async () => {
      setProfile(await p2p.get(profileUrl))
    })()
  }, [])

  if (!content || !profile) return null

  return (
    <>
      <TopRow>
        <Title>Edit Content</Title>
      </TopRow>
      <EditForm
        p2p={p2p}
        url={content.rawJSON.url}
        parentUrl={content.rawJSON.parents}
        title={content.rawJSON.title}
        description={content.rawJSON.description}
        subtype={content.rawJSON.subtype}
        main={content.rawJSON.main}
        authors={content.rawJSON.authors}
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
          const dir = `${p2p.baseDir}/${encode(content.rawJSON.url)}`
          const filesByDestination = {}
          for (const [source, destination] of Object.entries(files)) {
            filesByDestination[destination] = source
          }
          for (const path of await fs.readdir(dir)) {
            if (path !== 'index.json' && !filesByDestination[path]) {
              await fs.unlink(`${dir}/${path}`)
            }
          }
          for (const [source, destination] of Object.entries(files)) {
            try {
              await fs.stat(`${dir}/${destination}`)
            } catch (_) {
              await fs.copyFile(source, `${dir}/${destination}`)
            }
          }

          await p2p.set({
            url: content.rawJSON.url,
            parents: undefined,
            authors: undefined
          })

          const {
            metadata: { version: newVersion }
          } = await p2p.set({
            url: content.rawJSON.url,
            subtype,
            title,
            description,
            main,
            parents: parent,
            authors
          })

          if (isRegister) {
            await p2p.register(
              `${encode(content.rawJSON.url)}+${newVersion}`,
              profileUrl
            )
            if (await ipcRenderer.invoke('getStoreValue', 'vault')) {
              await archiveModule(`${content.rawJSON.url}+${newVersion}`)
            }
            history.push(
              `/profiles/${encode(profileUrl)}/${encode(
                content.rawJSON.url
              )}/${newVersion}`
            )
          } else {
            history.push(`/drafts/${encode(content.rawJSON.url)}`)
          }
        }}
      />
    </>
  )
}

export default Edit
