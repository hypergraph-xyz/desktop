import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { purple, white, green, yellow, red, gray } from '../../lib/colors'
import { encode } from 'dat-encoding'
import { Button, Title } from '../layout/grid'
import { useHistory, Link } from 'react-router-dom'
import Arrow from '../icons/arrow.svg'
import { remote } from 'electron'
import { promises as fs } from 'fs'
import AdmZip from 'adm-zip'
import { Label } from '../forms/forms'
import subtypes from '@hypergraph-xyz/wikidata-identifiers'
import Anchor from '../anchor'
import newlinesToBr from '../../lib/newlines-to-br'
import { ProfileContext } from '../../lib/context'
import isContentRegistered from '../../lib/is-content-registered'

const Container = styled.div`
  margin: 2rem;
`
const BackArrow = styled(Arrow)`
  transform: rotate(270deg);
  display: block;
  margin-bottom: 2rem;
`
const Parent = styled(Link)`
  text-decoration: none;
  color: ${white};
  border-bottom: 2px solid ${purple};
  display: inline-block;
  -webkit-app-region: no-drag;
  margin-bottom: 2rem;

  :hover {
    background-color: ${purple};
    cursor: pointer;
  }
`
const ContentTitle = styled.div`
  font-size: 2rem;
  line-height: 1.25;
  margin-bottom: 2rem;
`
const AuthorWithContentRegistration = styled(Anchor).attrs({
  as: Link
})`
  display: inline-block;
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
  margin-bottom: 4rem;
`
const Files = styled.div`
  margin-bottom: 4rem;
`
const File = styled.div`
  width: 100%;
  border: 2px solid ${green};
  line-height: 2;
  padding-left: 1rem;
  padding-right: 1rem;
  margin-top: 1rem;
  max-width: 40rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  :hover {
    background-color: ${green};
  }
  :active {
    background-color: inherit;
  }
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

  return authors && parents ? (
    <>
      {renderRow(
        <>
          <Title>{subtypes[content.rawJSON.subtype] || 'Content'}</Title>
          <Button onClick={() => remote.shell.openPath(directory)}>
            Open folder
          </Button>
          <ExportZip directory={directory} />
        </>
      )}
      <Container>
        <BackArrow onClick={() => history.go(-1)} />
        {parents.map(parent => (
          <Parent
            key={`${parent.rawJSON.url}+${parent.rawJSON.version}`}
            to={`/profile/${encode(parent.rawJSON.authors[0])}/${encode(
              parent.rawJSON.url
            )}`}
          >
            {parent.rawJSON.title}
          </Parent>
        ))}
        <ContentTitle>{content.rawJSON.title}</ContentTitle>
        {authors.map(author => {
          return isContentRegistered(content, author) ? (
            <AuthorWithContentRegistration
              key={author.rawJSON.url}
              to={`/profile/${encode(author.rawJSON.url)}`}
            >
              {author.rawJSON.title}
            </AuthorWithContentRegistration>
          ) : (
            <AuthorWithoutContentRegistration key={author.rawJSON.url}>
              {author.rawJSON.title}
            </AuthorWithoutContentRegistration>
          )
        })}
        <Description>{newlinesToBr(content.rawJSON.description)}</Description>
        {files && files.length > 0 && (
          <>
            <Label>Files</Label>
            <Files>
              {files &&
                files.map(path => (
                  <File
                    key={path}
                    onClick={() => {
                      remote.shell.openPath(`${directory}/${path}`)
                    }}
                  >
                    {path}
                  </File>
                ))}
            </Files>
          </>
        )}
        {canRegisterContent ? (
          <Button
            color={green}
            isLoading={isUpdatingRegistration}
            onClick={async () => {
              setIsUpdatingRegistration(true)
              try {
                await p2p.register(
                  `dat://${encode(content.rawJSON.url)}+${
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
                  `dat://${encode(content.rawJSON.url)}+${
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
      </Container>
    </>
  ) : null
}

export default Content
