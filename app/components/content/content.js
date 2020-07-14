import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { purple, white, green, yellow, red, gray } from '../../lib/colors'
import { encode } from 'dat-encoding'
import { Button, Title } from '../layout/grid'
import { useHistory, Link } from 'react-router-dom'
import Arrow from '../arrow.svg'
import { remote } from 'electron'
import { promises as fs } from 'fs'
import AdmZip from 'adm-zip'
import { Label } from '../forms/forms'
import subtypes from '@hypergraph-xyz/wikidata-identifiers'
import Anchor from '../anchor'
import newlinesToBr from '../../lib/newlines-to-br'

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
const ModuleTitle = styled.div`
  font-size: 2rem;
  line-height: 1.25;
  margin-bottom: 2rem;
`
const AuthorOfRegisteredContent = styled(Anchor).attrs({
  as: Link
})`
  display: inline-block;
  font-size: 1.5rem;
`
const AuthorOfUnregisteredContent = styled.span`
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

const modDirectory = mod =>
  `${remote.app.getPath('home')}/.p2pcommons/${encode(mod.rawJSON.url)}`

const OpenFolder = ({ mod }) => (
  <Button onClick={() => remote.shell.openPath(modDirectory(mod))}>
    Open folder
  </Button>
)

const ExportZip = ({ mod }) => (
  <Button
    onClick={async () => {
      const zip = new AdmZip()
      const dir = modDirectory(mod)
      const files = await fs.readdir(dir)
      for (const path of files) {
        zip.addLocalFile(`${dir}/${path}`)
      }
      const { filePath } = await remote.dialog.showSaveDialog(
        remote.getCurrentWindow(),
        {
          defaultPath: 'module.zip'
        }
      )
      if (filePath) zip.writeZip(filePath)
    }}
  >
    Export .zip
  </Button>
)

const Content = ({ p2p, content, profile, setProfile, renderRow }) => {
  const [authors, setAuthors] = useState()
  const [parents, setParents] = useState()
  const [files, setFiles] = useState()
  const [isRegistered, setIsRegistered] = useState()
  const [isDeleting, setIsDeleting] = useState(false)
  const history = useHistory()

  const dir = modDirectory(content)

  useEffect(() => {
    ;(async () => {
      const profiles = await p2p.listProfiles()
      const authors = content.rawJSON.authors.map(url => {
        const [key] = url.split('+')
        const author = profiles.find(p => encode(p.rawJSON.url) === encode(key))
        return author.rawJSON.title
      })
      setAuthors(authors)
    })()
  }, [content.rawJSON.url])

  useEffect(() => {
    ;(async () => {
      const parents = await Promise.all(
        content.rawJSON.parents.map(async url => p2p.clone(...url.split('+')))
      )
      setParents(parents)
    })()
  }, [content.rawJSON.url])

  useEffect(() => {
    ;(async () => {
      const isRegistered = Boolean(
        profile.rawJSON.contents.find(url => {
          const [otherKey] = url.split('+')
          return encode(content.rawJSON.url) === encode(otherKey)
        })
      )
      setIsRegistered(isRegistered)
    })()
  }, [content.rawJSON.url, profile])

  useEffect(() => {
    ;(async () => {
      const files = await fs.readdir(dir)
      setFiles(files.filter(path => path !== 'index.json'))
    })()
  }, [content.rawJSON.url])

  return authors && parents ? (
    <>
      {renderRow(
        <>
          <Title>{subtypes[content.rawJSON.subtype] || 'Content'}</Title>
          <OpenFolder mod={content} />
          <ExportZip mod={content} />
        </>
      )}
      <Container>
        <BackArrow onClick={() => history.go(-1)} />
        {parents.map(parent => (
          <Parent
            key={`${parent.rawJSON.url}+${parent.rawJSON.version}`}
            to={`/content/${encode(parent.rawJSON.url)}`}
          >
            {parent.rawJSON.title}
          </Parent>
        ))}
        <ModuleTitle>{content.rawJSON.title}</ModuleTitle>
        {authors.map(author =>
          isRegistered ? (
            <AuthorOfRegisteredContent key={author} to='/profile'>
              {author}
            </AuthorOfRegisteredContent>
          ) : (
            <AuthorOfUnregisteredContent key={author}>
              {author}
            </AuthorOfUnregisteredContent>
          )
        )}
        <Description>{newlinesToBr(content.rawJSON.description)}</Description>
        {files && files.length > 0 && (
          <>
            <Label>Files</Label>
            <Files>
              {files &&
                files.map(path => (
                  <File
                    key={path}
                    onClick={() => remote.shell.openPath(`${dir}/${path}`)}
                  >
                    {path}
                  </File>
                ))}
            </Files>
          </>
        )}
        {isRegistered ? (
          <Button
            color={yellow}
            onClick={async () => {
              await p2p.deregister(
                `dat://${encode(content.rawJSON.url)}+${
                  content.metadata.version
                }`,
                profile.rawJSON.url
              )
              setProfile(await p2p.get(profile.rawJSON.url))
              history.replace(`/content/${encode(content.rawJSON.url)}`)
            }}
          >
            Remove from profile
          </Button>
        ) : (
          <Button
            color={green}
            onClick={async () => {
              await p2p.register(
                `dat://${encode(content.rawJSON.url)}+${
                  content.metadata.version
                }`,
                profile.rawJSON.url
              )
              setProfile(await p2p.get(profile.rawJSON.url))
            }}
          >
            Add to profile
          </Button>
        )}
        <Button
          color={red}
          isLoading={isDeleting}
          onClick={async () => {
            setIsDeleting(true)
            await p2p.delete(content.rawJSON.url)
            setProfile(await p2p.get(profile.rawJSON.url))
            history.push('/')
          }}
        >
          Delete content
        </Button>
      </Container>
    </>
  ) : null
}

export default Content
