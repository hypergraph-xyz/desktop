import React, { useState, useEffect, useRef, useContext } from 'react'
import styled, { css } from 'styled-components'
import { Button } from '../layout/grid'
import ArrowUp2Rem from '../icons/arrow-up-2rem.svg'
import { Label, Select, Textarea } from '../forms/forms'
import TitleInput from '../forms/title-input'
import subtypes from '@hypergraph-xyz/wikidata-identifiers'
import AddFile from './add-file.svg'
import { remote, ipcRenderer } from 'electron'
import {
  purple,
  red,
  green,
  yellow,
  gray,
  white,
  black
} from '../../lib/colors'
import { basename, dirname, extname, join } from 'path'
import X from '../icons/x-1rem.svg'
import { useHistory } from 'react-router-dom'
import Anchor from '../anchor'
import { promises as fs } from 'fs'
import { encode } from 'dat-encoding'
import Tabbable from '../accessibility/tabbable'
import { ProfileContext } from '../../lib/context'
import ArrowDown1Rem from '../icons/arrow-down-1rem.svg'
import { validations } from '@p2pcommons/sdk-js'
import NewSelect from 'react-select'

const { FormData } = window
const options = Object.keys(subtypes).map(key => {
  return { value: key, label: subtypes[key] }
})

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
  padding-bottom: 2rem;
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
// specific react-select style
// does not use styled-components
const customSelectStyle = {
  clearIndicator: (provided, state) => ({
    // display: 'none'
    marginRight: '2.5rem',
    alignSelf: 'flex-end',
    position: 'absolute',
    right: 0
  }),
  container: provided => ({
    ...provided,
    marginBottom: '1rem'
  }),
  control: provided => ({
    ...provided,
    borderRadius: 0,
    margin: 0,
    borderColor: purple,
    borderWidth: 2,
    backgroundColor: black,
    hoverBorderColor: white,
    '&:hover': {
      borderColor: purple
    },
    boxShadow: 'none',
    position: 'relative'
  }),
  dropdownIndicator: () => ({
    marginRight: '1rem',
    alignSelf: 'flex-end',
    position: 'absolute',
    right: 0
    // display: "inline",
  }),
  indicatorSeparator: () => ({}),
  input: provided => ({
    position: 'absolute',
    top: '5px',
    fontFamily: 'Roboto',
    display: 'inline-block',
    marginLeft: '1rem',
    opacity: 0
  }),
  menu: provided => ({
    ...provided,
    margin: 0,
    borderRadius: 0,
    borderBottom: `2px solid ${purple}`,
    borderLeft: `2px solid ${purple}`,
    borderRight: `2px solid ${purple}`
  }),
  menuList: provided => ({
    ...provided,
    marginTop: 0,
    maxHeight: '14rem',
    fontFamily: 'Roboto',
    backgroundColor: black
  }),
  multiValue: (provided, state) => ({
    margin: '5px 2px 3px 2px',
    backgroundColor: purple,
    borderRadius: 100,
    display: 'inline-block',
    width: 'auto',
    maxHeight: '24px',
    position: 'relative'
  }),
  multiValueLabel: (provided, state) => ({
    // use this to adjust the text
    ...provided,
    color: white,
    marginLeft: '8px',
    marginRight: '8px',
    minWidth: '60px',
    maxWidth: '180px',
    position: 'relative',
    padding: 0,
    paddingLeft: 0,
    fontSize: '100%'
    // alignSelf: 'center'
  }),
  multiValueRemove: (provided, state) => ({
    margin: 0,
    color: purple,
    width: '16px',
    height: '20px',
    opacity: 0,
    position: 'absolute',
    top: '4px',
    right: '1px',
    borderRadius: 100,
    '&:hover': {
      color: white,
      backgroundColor: purple,
      opacity: 100
    }
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? purple : null,
    margin: 0,
    paddingLeft: '1rem',
    border: purple
  }),
  noOptionsMessage: () => ({
    margin: '1rem',
    color: gray,
    height: '1rem'
  }),
  placeholder: provided => ({
    ...provided,
    marginLeft: '1rem'
  }),
  singleValue: provided => ({
    ...provided,
    color: white,
    fontFamily: 'Roboto',
    marginLeft: '1rem'
  }),
  valueContainer: () => ({
    // marginLeft: '1rem',
    // marginTop: 5,
    display: 'inline-block'
  })
}

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
  const [potentialParents, setPotentialParents] = useState([])
  const [parents, setParents] = useState([])
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

      const contentUrls = [
        ...new Set(profiles.map(profile => profile.rawJSON.contents).flat())
      ]

      if (parentUrl) {
        await Promise.all(
          [parentUrl]
            .flat()
            .map(url => url.split('+'))
            .filter(
              ([key]) => !url || encode(key) !== encode(url.split('+')[0])
            )
            .map(([key, version]) => p2p.clone(encode(key), version))
        ).then(oldParents => {
          const x = []
          oldParents.map(parent => {
            const value = [
              encode(parent.rawJSON.url),
              parent.metadata.version
            ].join('+')
            x.push({ value, label: parent.rawJSON.title })
          })
          setParents(parents.concat(x))
        })
      }

      await Promise.all(
        contentUrls
          .map(url => url.split('+'))
          .filter(([key]) => !url || encode(key) !== encode(url.split('+')[0]))
          .map(([key, version]) => p2p.clone(encode(key), version))
      ).then(rawParent => {
        const x = []
        rawParent.map(parent => {
          const value = [
            encode(parent.rawJSON.url),
            parent.metadata.version
          ].join('+')
          x.push({ value, label: parent.rawJSON.title })
        })
        setPotentialParents(x)
      })
    })()
  }, [])

  // CHJH: This violates rules of hooks TODO
  if (url) {
    useEffect(() => {
      ;(async () => {
        const dir = `${p2p.baseDir}/${encode(url)}`
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
      parent: parents.map(obj => {
        return obj.value
      }),
      main,
      files,
      isRegister,
      authors
    })
  }

  const handleParents = x => {
    setParents(x === null ? [] : x)
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
            <NewSelect
              defaultValue={parents}
              isMulti
              name='parent'
              options={potentialParents}
              className='basic-multi-select'
              classNamePrefix='select'
              onChange={handleParents}
              styles={customSelectStyle}
            />
          </>
        )}
        <Label htmlFor='subtype'>Content type</Label>
        <NewSelect
          className='basic-single'
          classNamePrefix='select'
          defaultValue={options[0]}
          name='subtype'
          options={options}
          styles={customSelectStyle}
        />
        <Label htmlFor='files'>Add files</Label>
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

            const invalidSources = []
            for (let i = newSources.length - 1; i >= 0; i--) {
              const source = newSources[i]
              try {
                await validations.validateMain({
                  indexMetadata: {
                    main: basename(source)
                  },
                  key: basename(dirname(source)),
                  p2pcommonsDir: join(source, '..', '..')
                })
              } catch (_) {
                invalidSources.push(source)
                newSources.splice(i, 1)
              }
            }
            if (invalidSources.length) {
              await remote.dialog.showMessageBox(remote.getCurrentWindow(), {
                type: 'warning',
                title: 'Open file formats',
                message:
                  'The following files will not be added as they ' +
                  'are not stored in open file formats:\n\n' +
                  invalidSources
                    .map((source, i) => {
                      if (i < 5) {
                        return `- ${source}\n`
                      }
                      if (i === 5) {
                        return `(and ${invalidSources.length - 5} more)`
                      }
                      return ''
                    })
                    .join('')
              })
            }

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
          {Object.values(files).map(destination => (
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
