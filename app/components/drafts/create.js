import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { TopRow, Title, Button } from '../layout/grid'
import Arrow from '../icons/arrow.svg'
import { Label, Select, Textarea } from '../forms/forms'
import TitleInput from '../forms/title-input'
import subtypes from '@hypergraph-xyz/wikidata-identifiers'
import AddFile from './add-file.svg'
import { remote } from 'electron'
import { purple, red } from '../../lib/colors'
import { basename, extname } from 'path'
import X from '../icons/x-1rem.svg'
import { promises as fs } from 'fs'
import { encode } from 'dat-encoding'
import { useHistory, useParams } from 'react-router-dom'
import Store from 'electron-store'
import { ProfileContext } from '../../lib/context'

const Container = styled.div`
  margin: 2rem 4rem;
  max-width: 40rem;
`
const BackArrow = styled(Arrow)`
  transform: rotate(270deg);
`
const Form = styled.form`
  margin-top: 2rem;
`
const Files = styled.div`
  margin-bottom: 2rem;
`
const File = styled.div`
  width: 100%;
  border: 2px solid ${purple};
  line-height: 2;
  padding-left: 1rem;
  margin-top: 1em;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 44px;
`
const RemoveFile = styled(X)`
  position: absolute;
  right: 14px;
  top: 8px;
`
const Parent = styled.p`
  margin-top: 0;
  margin-bottom: 2rem;
`
const Info = styled.p`
  margin-bottom: 2rem;
`

const store = new Store()

const allIndexesOf = (arr, el) => {
  const indexes = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === el) indexes.push(i)
  }
  return indexes
}

const Create = ({ p2p }) => {
  const [files, setFiles] = useState({})
  const [isCreating, setIsCreating] = useState(false)
  const [parent, setParent] = useState()
  const [isValid, setIsValid] = useState(false)
  const history = useHistory()
  const { parentUrl } = useParams()
  const { url: profileUrl } = useContext(ProfileContext)

  if (parentUrl) {
    useEffect(() => {
      ;(async () => {
        const [key, version] = parentUrl.split('+')
        setParent(await p2p.clone(key, version))
      })()
    }, [])
  }

  useEffect(() => {
    document.documentElement.scrollTop = 0
  }, [])

  const setFilesUnique = files => {
    const sources = Object.keys(files)
    const destinations = sources.map(source => basename(source))
    for (let i = 0; i < sources.length; i++) {
      const [source, destination] = [sources[i], destinations[i]]
      const indexes = allIndexesOf(destinations, destination)
      const indexInIndexes = indexes.indexOf(i)
      if (indexInIndexes > 0) {
        const ext = extname(destination)
        const base = basename(destination, ext)
        files[source] = `${base} (${indexInIndexes + 1})${ext}`
      } else {
        files[source] = destination
      }
    }
    setFiles(files)
  }

  return (
    <>
      <TopRow>
        <Title>Add Content</Title>
      </TopRow>
      <Container>
        <BackArrow onClick={() => history.go(-1)} />
        <Form
          onSubmit={async e => {
            e.preventDefault()
            setIsCreating(true)

            const subtype = e.target.subtype.value
            const title = e.target.title.value
            const description = e.target.description.value
            const main = e.target.main.value

            console.time('init')
            const {
              rawJSON: { url }
            } = await p2p.init({
              type: 'content',
              subtype,
              title,
              description,
              authors: [profileUrl],
              ...(parentUrl && { parents: [`hyper://${parentUrl}`] })
            })
            console.timeEnd('init')

            const dir = `${remote.app.getPath('home')}/.p2pcommons/${encode(
              url
            )}`
            for (const [source, destination] of Object.entries(files)) {
              await fs.copyFile(source, `${dir}/${destination}`)
            }
            if (main) await p2p.set({ url, main })
            history.push('/')
          }}
        >
          {parent && (
            <>
              <Label htmlFor='parent'>Follows from</Label>
              <Parent>{parent.rawJSON.title}</Parent>
            </>
          )}
          <Label htmlFor='subtype'>Content type</Label>
          <Select large name='subtype'>
            {Object.entries(subtypes).map(([id, text]) => (
              <option value={id} key={id}>
                {text}
              </option>
            ))}
          </Select>
          <Label htmlFor='files'>Upload files</Label>
          <Info>
            These files are copied to Hypergraph. If you want to work on them
            further, you can choose to work using Hypergraph’s copies or
            reimport the files into Hypergraph when you’re done.
          </Info>
          <Button
            type='button'
            onClick={async e => {
              e.preventDefault()
              const opts = {
                properties: ['multiSelections', 'openFile']
              }
              if (!store.get('create open dialog displayed')) {
                // set the default path on first launch, so it's not the
                // app's directory
                opts.defaultPath = remote.app.getPath('documents')
                store.set('create open dialog displayed', true)
              }
              const {
                filePaths: newSources
              } = await remote.dialog.showOpenDialog(
                remote.getCurrentWindow(),
                opts
              )

              const newFiles = { ...files }
              for (const source of newSources) {
                const destination = basename(source)
                newFiles[source] = destination
              }

              setFilesUnique(newFiles)
            }}
          >
            <AddFile />
          </Button>
          <Files>
            {Object.entries(files).map(([source, destination]) => (
              <File key={source}>
                {destination}
                <RemoveFile
                  onClick={() => {
                    const newFiles = { ...files }
                    delete newFiles[source]
                    setFilesUnique(newFiles)
                  }}
                />
              </File>
            ))}
          </Files>
          <Label htmlFor='main'>Main file</Label>
          <Select name='main'>
            <option value=''>No main</option>
            {Object.values(files)
              .filter(destination => destination.charAt(0) !== '.')
              .map(destination => (
                <option value={destination} key={destination}>
                  {destination}
                </option>
              ))}
          </Select>
          <Label htmlFor='title'>Title</Label>
          <TitleInput name='title' onIsValid={setIsValid} />
          <Label htmlFor='description'>Description</Label>
          <Textarea name='description' />
          <Button emphasis='top' isLoading={isCreating} disabled={!isValid}>
            Add content
          </Button>
          <Button color={red} onClick={() => history.push('/')}>
            Cancel
          </Button>
        </Form>
      </Container>
    </>
  )
}

export default Create
