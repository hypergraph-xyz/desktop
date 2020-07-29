import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { green, yellow, red, gray } from '../../lib/colors'
import { encode } from 'dat-encoding'
import { Button, Title } from '../layout/grid'
import { useHistory, Link } from 'react-router-dom'
import Anchor from '../anchor'
import Arrow from '../icons/arrow.svg'
import { remote } from 'electron'
import { promises as fs } from 'fs'
import AdmZip from 'adm-zip'
import { Label } from '../forms/forms'
import subtypes from '@hypergraph-xyz/wikidata-identifiers'
import newlinesToBr from '../../lib/newlines-to-br'
import { ProfileContext } from '../../lib/context'
import isContentRegistered from '../../lib/is-content-registered'
import Share from '../icons/share.svg'
import ShareModal from './share-modal'

const Container = styled.div`
  margin: 2rem;
`
const BackArrow = styled(Arrow)`
  transform: rotate(270deg);
  display: block;
  margin-bottom: 2rem;
`
const Parent = styled(Anchor)`
  margin-bottom: 2rem;
`
const ContentTitle = styled.h2`
  font-weight: normal;
  margin-block-start: 0;
  margin-block-end: 0;
`
const AuthorWithContentRegistration = styled(Anchor)`
  font-size: 1.5rem;
`
const AuthorWithoutContentRegistration = styled.span`
  color: ${gray};
  display: inline-block;
  font-size: 1.5rem;
  margin-bottom: 2px;
`
const Description = styled.div`
  margin-top: 2rem;
  margin-bottom: 1.5rem;
`
const NoMain = styled.div`
  margin-bottom: 1rem;
`
const File = styled.div`
  width: 100%;
  border: 2px solid ${green};
  line-height: 2;
  padding-left: 0.5rem;
  padding-right: 1rem;
  max-width: 40rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  :not(:last-of-type) {
    margin-bottom: 0.5rem;
  }

  :hover {
    background-color: ${green};
  }
  :active {
    background-color: inherit;
  }
`
const Actions = styled.div`
  margin-top: 2rem;
`

const ExportZip = directory => (
  <Button
    onClick={async () => {
      const zip = new AdmZip()
      const files = await fs.readdir(directory)
      for (const path of files) {
        zip.addLocalFile(`${directory}/${path}`)
      }
      const { filePath } = await remote.dialog.showSaveDialog(
        remote.getCurrentWindow(),
        {
          defaultPath: 'content.zip'
        }
      )
      if (filePath) zip.writeZip(filePath)
    }}
  >
    Export .zip
  </Button>
)

const getContentDirectory = async content => {
  const directory = `${remote.app.getPath('home')}/.p2pcommons/${encode(
    content.rawJSON.url
  )}`
  try {
    const directoryWithVersion = `${directory}+${content.metadata.version}`
    await fs.stat(directoryWithVersion)
    return directoryWithVersion
  } catch (_) {
    return directory
  }
}

const Content = ({ p2p, content, renderRow }) => {
  const [directory, setDirectory] = useState()
  const [authors, setAuthors] = useState()
  const [parents, setParents] = useState()
  const [files, setFiles] = useState()
  const [isDeleting, setIsDeleting] = useState()
  const [isUpdatingRegistration, setIsUpdatingRegistration] = useState()
  const [canRegisterContent, setCanRegisterContent] = useState()
  const [canDeregisterContent, setCanDeregisterContent] = useState()
  const [isSharing, setIsSharing] = useState()
  const history = useHistory()
  const { url: profileUrl } = useContext(ProfileContext)

  useEffect(() => {
    ;(async () => {
      const directory = await getContentDirectory(content)
      setDirectory(directory)
      await fetchFiles(directory)
    })()
  }, [content.rawJSON.url])

  const fetchAuthors = async () => {
    const authors = await Promise.all(
      content.rawJSON.authors.map(key =>
        p2p.clone(key, null, /* download */ false)
      )
    )
    setAuthors(authors)
  }

  const fetchParents = async () => {
    const parents = await Promise.all(
      content.rawJSON.parents.map(url =>
        p2p.clone(url.split('+')[0], null, /* download */ false)
      )
    )
    setParents(parents)
  }

  const fetchFiles = async directory => {
    const files = await fs.readdir(directory)
    setFiles(files.filter(path => path !== 'index.json'))
  }

  const fetchCanRegisterOrDeregisterContent = async () => {
    const profile = authors.find(
      author => encode(author.rawJSON.url) === encode(profileUrl)
    )
    if (profile) {
      setCanRegisterContent(!isContentRegistered(content, profile))
      setCanDeregisterContent(isContentRegistered(content, profile))
    } else {
      setCanRegisterContent(false)
      setCanDeregisterContent(false)
    }
  }

  useEffect(() => {
    fetchAuthors()
    fetchParents()
  }, [content.rawJSON.url])

  useEffect(() => {
    if (authors) fetchCanRegisterOrDeregisterContent()
  }, [authors])

  const supportingFiles = files
    ? files.filter(file => file !== content.rawJSON.main)
    : []

  return authors && parents ? (
    <>
      {isSharing && (
        <ShareModal
          url={
            authors.find(author => isContentRegistered(content, author))
              ? `${content.rawJSON.url}+${content.metadata.version}`
              : content.rawJSON.url
          }
          onClose={() => setIsSharing(false)}
        />
      )}
      {renderRow(
        <>
          <Title>{subtypes[content.rawJSON.subtype] || 'Content'}</Title>
          {content.rawJSON.main && (
            <Button
              content='icon'
              type='button'
              onClick={() => setIsSharing(true)}
            >
              <Share />
            </Button>
          )}
          <Button onClick={() => remote.shell.openPath(directory)}>
            Open folder
          </Button>
          <ExportZip directory={directory} />
        </>
      )}
      <Container>
        <BackArrow onClick={() => history.go(-1)} />
        {parents.map(parent => (
          <Link
            component={Parent}
            key={`${parent.rawJSON.url}+${parent.rawJSON.version}`}
            to={`/profiles/${encode(parent.rawJSON.authors[0])}/${encode(
              parent.rawJSON.url
            )}`}
          >
            {parent.rawJSON.title}
          </Link>
        ))}
        <ContentTitle>{content.rawJSON.title}</ContentTitle>
        {authors.map(author => {
          return isContentRegistered(content, author) ? (
            <Link
              component={AuthorWithContentRegistration}
              key={author.rawJSON.url}
              to={`/profiles/${encode(author.rawJSON.url)}`}
            >
              {author.rawJSON.title}
            </Link>
          ) : (
            <AuthorWithoutContentRegistration key={author.rawJSON.url}>
              {author.rawJSON.title}
            </AuthorWithoutContentRegistration>
          )
        })}
        <Description>{newlinesToBr(content.rawJSON.description)}</Description>
        <Label>Main file</Label>
        {content.rawJSON.main ? (
          <File
            onClick={() => {
              remote.shell.openPath(`${directory}/${content.rawJSON.main}`)
            }}
          >
            {content.rawJSON.main}
          </File>
        ) : (
          <NoMain>Required for adding to profile and sharing</NoMain>
        )}
        {supportingFiles.length > 0 && (
          <>
            <Label>Supporting Files</Label>
            <div>
              {supportingFiles.map(path => (
                <File
                  key={path}
                  onClick={() => {
                    remote.shell.openPath(`${directory}/${path}`)
                  }}
                >
                  {path}
                </File>
              ))}
            </div>
          </>
        )}
        <Actions>
          {canRegisterContent ? (
            <Button
              color={green}
              isLoading={isUpdatingRegistration}
              disabled={!content.rawJSON.main}
              onClick={async () => {
                setIsUpdatingRegistration(true)
                try {
                  console.time('register')
                  await p2p.register(
                    `hyper://${encode(content.rawJSON.url)}+${
                      content.metadata.version
                    }`,
                    profileUrl
                  )
                  console.timeEnd('register')
                } finally {
                  setIsUpdatingRegistration(false)
                }
                await fetchAuthors()
              }}
            >
              Add to profile
            </Button>
          ) : canDeregisterContent ? (
            <Button
              color={yellow}
              isLoading={isUpdatingRegistration}
              onClick={async () => {
                setIsUpdatingRegistration(true)
                try {
                  await p2p.deregister(
                    `hyper://${encode(content.rawJSON.url)}+${
                      content.metadata.version
                    }`,
                    profileUrl
                  )
                } finally {
                  setIsUpdatingRegistration(false)
                }
                await fetchAuthors()
              }}
            >
              Remove from profile
            </Button>
          ) : null}
          {content.metadata.isWritable && (
            <Button
              color={red}
              isLoading={isDeleting}
              onClick={async () => {
                setIsDeleting(true)
                await p2p.delete(content.rawJSON.url)
                history.push('/')
              }}
            >
              Delete content
            </Button>
          )}
        </Actions>
      </Container>
    </>
  ) : null
}

export default Content
