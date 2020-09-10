import React, { useState, useEffect, useRef, useContext } from 'react'
import styled, { css } from 'styled-components'
import { Button } from '../layout/grid'
import ArrowUp2Rem from '../icons/arrow-up-2rem.svg'
import { Label, Select, Textarea } from '../forms/forms'
import TitleInput from '../forms/title-input'
import subtypes from '@hypergraph-xyz/wikidata-identifiers'
import AddFile from './add-file.svg'
import { remote, ipcRenderer } from 'electron'
import { purple, red, green, yellow, gray, white } from '../../lib/colors'
import { basename, extname } from 'path'
import X from '../icons/x-1rem.svg'
import { useHistory } from 'react-router-dom'
import Anchor from '../anchor'
import { promises as fs } from 'fs'
import { encode } from 'dat-encoding'
import Tabbable from '../accessibility/tabbable'
import { ProfileContext } from '../../lib/context'
import ArrowDown1Rem from '../icons/arrow-down-1rem.svg'

const { FormData } = window

const Container = styled.div`
  margin: 2rem;
  max-width: 40rem;
`
const BackArrow = styled(ArrowUp2Rem)`
  transform: rotate(270deg);
`
const Form = styled.form`
  margin-top: 2rem;
`
const FileAuthorBlocks = styled.div`
  margin-bottom: 2rem;
`
const FileAuthorBlock = styled.div`
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
  padding-right: 14px;
  display: flex;
  align-items: center;
`
const RemoveFileAuthor = styled(X)`
  margin-left: auto;
`
const Info = styled.p`
  margin-bottom: 2rem;
`
const ButtonGroup = styled.div`
  display: flex;
  align-items: baseline;
`
const ReorderArrow = styled(({ isEnabled, ...rest }) => (
  <ArrowDown1Rem {...rest} />
))`
  ${props =>
    props.direction === 'up' &&
    css`
      transform: rotate(180deg);
    `}
  path {
    fill: ${props => props => (props.isEnabled ? white : gray)};
  }
  margin-right: 0.5rem;
`
const ReorderAuthor = ({ direction, isEnabled, onClick }) => (
  <ReorderArrow
    direction={direction}
    isEnabled={isEnabled}
    onClick={() => isEnabled && onClick()}
  />
)

const allIndexesOf = (arr, el) => {
  const indexes = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === el) indexes.push(i)
  }
  return indexes
}

const EditForm = ({
  p2p,
  parentUrl,
  url,
  title,
  description,
  subtype,
  main: defaultMain,
  authors: defaultAuthors,
  onSubmit
}) => {
  const history = useHistory()
  const [isSaving, setIsSaving] = useState()
  const [isValid, setIsValid] = useState()
  const [isValidDraft, setIsValidDraft] = useState()
  const [files, setFiles] = useState({})
  const [main, setMain] = useState(defaultMain)
  const [potentialParents, setPotentialParents] = useState()
  const [profiles, setProfiles] = useState()
  const { url: profileUrl } = useContext(ProfileContext)
  const [authors, setAuthors] = useState(defaultAuthors || [encode(profileUrl)])
  const formRef = useRef()

  useEffect(() => {
    setIsValid(isValidDraft && Boolean(main))
  }, [isValidDraft, main])

  useEffect(() => {
    ;(async () => {
      const profiles = await p2p.listProfiles()
      setProfiles(profiles)
      setPotentialParents(
        (
          await Promise.all(
            profiles.map(profile =>
              Promise.all(
                profile.rawJSON.contents
                  .map(url => url.split('+'))
                  .filter(
                    ([key]) => !url || encode(key) !== encode(url.split('+')[0])
                  )
                  .map(([key, version]) =>
                    p2p.clone(encode(key), version, /* download */ false)
                  )
              )
            )
          )
        ).flat()
      )
    })()
  }, [])

  if (url) {
    useEffect(() => {
      ;(async () => {
        const dir = `${remote.app.getPath('home')}/.p2pcommons/${encode(url)}`
        const paths = await fs.readdir(dir)
        const files = {}
        for (const path of paths) {
          if (path === 'index.json') continue
          files[`${dir}/${path}`] = path
        }
        setFiles(files)
      })()
    }, [])
  }

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

  const save = async ({ isRegister } = {}) => {
    setIsSaving(true)
    const data = new FormData(formRef.current)
    await onSubmit({
      title: data.get('title'),
      description: data.get('description'),
      subtype: data.get('subtype'),
      parent: data.get('parent'),
      main,
      files,
      isRegister,
      authors
    })
  }

  return (
    <Container>
      <Tabbable component={BackArrow} onClick={() => history.go(-1)} />
      <Form
        ref={formRef}
        onSubmit={async ev => {
          ev.preventDefault()
          await save({ isRegister: false })
        }}
      >
        {potentialParents && potentialParents.length > 0 && (
          <>
            <Label htmlFor='parent'>Follows from</Label>
            <Select name='parent' defaultValue={parentUrl}>
              <option value=''>None</option>
              {potentialParents.map(parent => {
                const value = [
                  encode(parent.rawJSON.url),
                  parent.metadata.version
                ].join('+')
                return (
                  <option value={value} key={value}>
                    {
                      profiles.find(
                        profile =>
                          encode(profile.rawJSON.url) ===
                          parent.rawJSON.authors[0]
                      ).rawJSON.title
                    }
                    {parent.rawJSON.authors.length > 1 ? ' et. al' : null}.{' '}
                    {parent.rawJSON.title}
                  </option>
                )
              })}
            </Select>
          </>
        )}
        <Label htmlFor='subtype'>Content type</Label>
        <Select name='subtype' defaultValue={subtype}>
          {Object.entries(subtypes).map(([id, text]) => (
            <option value={id} key={id}>
              {text}
            </option>
          ))}
        </Select>
        <Label htmlFor='files'>Upload files</Label>
        <Info>
          These files are copied to Hypergraph. If you want to work on them
          further, you can choose to work using Hypergraph’s copies or reimport
          the files into Hypergraph when you’re done.
        </Info>
        <Button
          type='button'
          onClick={async e => {
            e.preventDefault()
            const opts = {
              properties: ['multiSelections', 'openFile']
            }
            if (
              !(await ipcRenderer.invoke(
                'getStoreValue',
                'create open dialog displayed'
              ))
            ) {
              // set the default path on first launch, so it's not the
              // app's directory
              opts.defaultPath = remote.app.getPath('documents')
              await ipcRenderer.invoke(
                'setStoreValue',
                'create open dialog displayed',
                true
              )
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
        <FileAuthorBlocks>
          {Object.entries(files).map(([source, destination]) => (
            <FileAuthorBlock key={source}>
              {destination}
              <RemoveFileAuthor
                onClick={() => {
                  const newFiles = { ...files }
                  delete newFiles[source]
                  setFilesUnique(newFiles)
                  if (main === destination) setMain(null)
                }}
              />
            </FileAuthorBlock>
          ))}
        </FileAuthorBlocks>
        <Label htmlFor='main'>Main file</Label>
        <Select
          name='main'
          value={main}
          onChange={ev => setMain(ev.target.value)}
        >
          <option value=''>None</option>
          {Object.values(files)
            .filter(destination => destination.charAt(0) !== '.')
            .map(destination => (
              <option value={destination} key={destination}>
                {destination}
              </option>
            ))}
        </Select>
        <Label htmlFor='title'>Title</Label>
        <TitleInput
          name='title'
          onIsValid={setIsValidDraft}
          defaultValue={title}
        />
        <Label htmlFor='authors'>Authors</Label>
        <Select
          onChange={ev => {
            if (!ev.target.value) return
            setAuthors([...authors, ev.target.value])
            ev.target.value = ''
          }}
        >
          <option value=''>Add author</option>
          {profiles &&
            profiles
              .filter(profile => profile.rawJSON.url !== profileUrl)
              .filter(profile => !authors.includes(encode(profile.rawJSON.url)))
              .map(profile => (
                <option
                  key={profile.rawJSON.url}
                  value={encode(profile.rawJSON.url)}
                >
                  {profile.rawJSON.title}
                </option>
              ))}
        </Select>
        <FileAuthorBlocks>
          {authors.map((author, i) => (
            <FileAuthorBlock key={author}>
              <ReorderAuthor
                direction='up'
                isEnabled={i !== 0 || undefined}
                onClick={ev => {
                  const newAuthors = [...authors]
                  newAuthors.splice(i, 1)
                  newAuthors.splice(i - 1, 0, author)
                  setAuthors(newAuthors)
                }}
              />
              <ReorderAuthor
                direction='down'
                isEnabled={i !== authors.length - 1 || undefined}
                onClick={ev => {
                  const newAuthors = [...authors]
                  newAuthors.splice(i, 1)
                  newAuthors.splice(i + 1, 0, author)
                  setAuthors(newAuthors)
                }}
              />
              {profiles &&
                profiles.find(profile => encode(profile.rawJSON.url) === author)
                  .rawJSON.title}
              {author !== encode(profileUrl) && (
                <RemoveFileAuthor
                  onClick={() => {
                    const newAuthors = [...authors]
                    newAuthors.splice(newAuthors.indexOf(author), 1)
                    setAuthors(newAuthors)
                  }}
                />
              )}
            </FileAuthorBlock>
          ))}
        </FileAuthorBlocks>
        <Label htmlFor='description'>Description</Label>
        <Textarea name='description' defaultValue={description} />
        <ButtonGroup>
          <Button
            type='button'
            isLoading={isSaving && isSaving.register}
            disabled={!isValid || isSaving}
            color={green}
            onClick={() => save({ isRegister: true })}
          >
            Add to profile
          </Button>
          <Button
            isLoading={isSaving && !isSaving.register}
            disabled={!isValidDraft || isSaving}
            color={yellow}
          >
            Save as draft
          </Button>
          <Anchor
            onClick={() => history.go(-1)}
            color={red}
            disabled={isSaving}
          >
            Cancel
          </Anchor>
        </ButtonGroup>
      </Form>
    </Container>
  )
}

export default EditForm
