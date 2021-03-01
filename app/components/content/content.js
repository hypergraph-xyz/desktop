import React, { useState, useEffect, useContext, Fragment } from 'react'
import styled from 'styled-components'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import behead from 'remark-behead'
import math from 'remark-math'
import TeX from '@matejmazur/react-katex'
import { colors } from '@libscie/design-library'
import { encode } from 'dat-encoding'
import path from 'path'

import { Button, Title } from '../layout/grid'
import { useHistory, Link } from 'react-router-dom'
import Anchor from '../anchor'
import Arrow from '../icons/arrow-up-2rem.svg'
import { remote, ipcRenderer, shell } from 'electron'
import { promises as fs } from 'fs'
import AdmZip from 'adm-zip'
import { Label } from '../forms/forms'
import subtypes from '@hypergraph-xyz/wikidata-identifiers'
import newlinesToBr from '../../lib/newlines-to-br'
import { ProfileContext } from '../../lib/context'
import isContentRegistered from '../../lib/is-content-registered'
import Share from '../icons/share.svg'
import ShareModal from './share-modal'
import Tabbable from '../accessibility/tabbable'
import { archiveModule } from '../../lib/vault'
import { Heading1 } from '../typography'
import Author from '../author/author'
import ContentPageSpinner from './content-page-spinner.svg'
import remark from 'remark'

const Container = styled.div`
  margin: 2rem;
`
const BackArrow = styled(Arrow)`
  transform: rotate(270deg);
  display: block;
  margin-bottom: 2rem;
`
const Authors = styled.div`
  font-size: 1.5rem;
  color: ${colors.mono500};
`
const Description = styled.div`
  margin-top: 2rem;
  margin-bottom: 1.5rem;
  max-width: 820px;
  text-align: justify;
`
const NoMain = styled.div`
  margin-bottom: 1rem;
`
const File = styled.div`
  width: 100%;
  border: 2px solid ${colors.green500};
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
    background-color: ${colors.green500};
  }
  :active {
    background-color: inherit;
  }
`
const Actions = styled.div`
  margin-top: 2rem;
  padding-bottom: 2rem;
`
const StyledHeading1 = styled(Heading1)`
  font-size: 2rem;
  margin-top: 2rem;
`
const MainContent = styled.div`
  max-width: 820px;
  text-align: justify;
  img {
    max-width: 100%;
    max-height: 700px;
    display: block;
    margin: 1rem auto;
  }
  a {
    border-bottom: 2px solid #574cfa;
    color: #ffffff;
    text-decoration: none;
  }
  a:hover {
    background: #574cfa;
  }
  table {
    border-bottom: 2px solid #574cfa;
    border-spacing: 0;
  }
  th {
    border-bottom: 2px solid #574cfa;
  }
  td {
    padding: 0.5rem;
    text-align: left;
  }
`

const ExportZip = ({ directory }) => (
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

const renderers = {
  inlineMath: ({ value }) => <TeX math={value} />,
  math: ({ value }) => <TeX block math={value} />
}

const getContentDirectory = async ({ p2p, key, version }) => {
  const directory = `${p2p.baseDir}/${key}`
  return version ? `${directory}+${version}` : directory
}

const secureFileOpen = async (dir, file) => {
  const isFile = (await fs.stat(`${dir}/${file}`)).isFile()
  const fileExtension = path.extname(file)
  if (
    (!fileExtension && isFile) ||
    fileExtension === '.ps1' ||
    fileExtension === '.sh' ||
    fileExtension === '.bat'
  ) {
    const choice = remote.dialog.showMessageBoxSync({
      type: 'question',
      title: 'Security',
      message:
        'For your security, Hypergraph will not open this file. Please inspect file manually.',
      buttons: ['Open folder', 'Cancel']
    })
    if (choice === 0) {
      shell.openPath(`${dir}`)
    }
    return
  }
  remote.shell.openPath(`${dir}/${file}`)
}

const Content = ({ p2p, contentKey: key, version, renderRow }) => {
  const [content, setContent] = useState()
  const [directory, setDirectory] = useState()
  const [authors, setAuthors] = useState()
  const [parents, setParents] = useState()
  const [files, setFiles] = useState()
  const [isDeleting, setIsDeleting] = useState()
  const [isUpdatingRegistration, setIsUpdatingRegistration] = useState()
  const [canRegisterContent, setCanRegisterContent] = useState()
  const [canDeregisterContent, setCanDeregisterContent] = useState()
  const [isSharing, setIsSharing] = useState()
  const [mainMarkdown, setMainMarkdown] = useState()
  const history = useHistory()
  const { url: profileUrl } = useContext(ProfileContext)

  useEffect(() => {
    ;(async () => {
      setContent(await p2p.clone(key, version))
    })()
  }, [key, version])

  useEffect(() => {
    ;(async () => {
      try {
        const directory = await getContentDirectory({ p2p, key, version })
        setDirectory(directory)
        await fetchFiles(directory)
      } catch (error) {
        if (error.code === 'ENOENT') {
          const choice = remote.dialog.showMessageBoxSync({
            type: 'question',
            title: 'Module unavailable',
            message:
              'You have not downloaded this research module. Would you like to download or delete it?',
            buttons: ['Redownload', 'Delete']
          })
          if (choice === 1) {
            const deleteFiles = false
            await p2p.delete(key, deleteFiles)
            history.go(-1)
          } else {
            await p2p.clone(key)
          }
        } else {
          throw error
        }
      }
    })()
  }, [key, version])

  const fetchAuthors = async () => {
    const authors = await Promise.all(
      content.rawJSON.authors.map(key => p2p.clone(encode(key)))
    )
    setAuthors(authors)
  }

  const fetchParents = async () => {
    const parents = await Promise.all(
      content.rawJSON.parents.map(url => {
        const [key, version] = url.split('+')
        return p2p.clone(encode(key), version)
      })
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
    if (!content) return
    fetchAuthors()
    fetchParents()
    ;(async () => {
      if (content.rawJSON.main.endsWith('.md')) {
        const md = await (
          await fs.readFile(`${directory}/${content.rawJSON.main}`)
        ).toString()
        remark()
          .use(behead, { depth: +1 })
          .process(md)
          .then(vfile => vfile.toString())
          .then(markdown => setMainMarkdown(markdown))
      }
    })()
  }, [content])

  useEffect(() => {
    if (!authors) return
    fetchCanRegisterOrDeregisterContent()
  }, [authors])

  const supportingFiles =
    files && content ? files.filter(file => file !== content.rawJSON.main) : []

  return content && authors && parents ? (
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
          {canRegisterContent && content.metadata.isWritable && (
            <Button
              type='button'
              color={colors.green500}
              onClick={() => {
                history.push(
                  `/edit/${encode(content.rawJSON.url)}/${
                    content.metadata.version
                  }`
                )
              }}
            >
              Edit content
            </Button>
          )}
        </>
      )}
      <Container>
        <Tabbable component={BackArrow} onClick={() => history.go(-1)} />
        {parents.map(parent => (
          <Link
            component={Anchor}
            key={`${parent.rawJSON.url}+${parent.rawJSON.version}`}
            to={`/profiles/${encode(parent.rawJSON.authors[0])}/${encode(
              parent.rawJSON.url
            )}/${parent.metadata.version}`}
          >
            {parent.rawJSON.title}
            <br />
          </Link>
        ))}
        <StyledHeading1>{content.rawJSON.title}</StyledHeading1>
        <Authors>
          {content.rawJSON.authors.map((authorUrl, i) => (
            <Fragment key={authorUrl}>
              {i > 0 && ', '}
              <Author
                p2p={p2p}
                url={authorUrl}
                content={content}
                Loading={ContentPageSpinner}
              />
            </Fragment>
          ))}
        </Authors>
        <Description>{newlinesToBr(content.rawJSON.description)}</Description>
        <Label>Main file</Label>
        {content.rawJSON.main.endsWith('.md') ? (
          <MainContent>
            <ReactMarkdown
              plugins={[gfm, math]}
              children={mainMarkdown}
              renderers={renderers}
              linkTarget='noopener noreferrer'
              transformImageUri={uri => {
                if (!uri.startsWith('http')) {
                  if (canRegisterContent) {
                    return `http://localhost:5152/${key}/${uri}`
                  } else {
                    return `http://localhost:5152/${key}+${version}/${uri}`
                  }
                }
                return uri
              }}
              transformLinkUri={uri => {
                if (!uri.startsWith('http')) {
                  if (canRegisterContent) {
                    return `http://localhost:5152/${key}/${uri}`
                  } else {
                    return `http://localhost:5152/${key}+${version}/${uri}`
                  }
                }
                return uri
              }}
            />
          </MainContent>
        ) : content.rawJSON.main ? (
          <Tabbable
            component={File}
            onClick={() => {
              secureFileOpen(directory, content.rawJSON.main)
            }}
            draggable
            onDragStart={event => {
              event.preventDefault()
              ipcRenderer.invoke(
                'dragOut',
                `${directory}/${content.rawJSON.main}`
              )
            }}
          >
            {content.rawJSON.main}
          </Tabbable>
        ) : (
          <NoMain>Required for adding to profile and sharing</NoMain>
        )}
        {supportingFiles.length > 0 && (
          <>
            <Label>Supporting Files</Label>
            <div>
              {supportingFiles.map(path => (
                <Tabbable
                  component={File}
                  key={path}
                  onClick={() => {
                    secureFileOpen(directory, path)
                  }}
                  draggable
                  onDragStart={event => {
                    event.preventDefault()
                    ipcRenderer.invoke('dragOut', `${directory}/${path}`)
                  }}
                >
                  {path}
                </Tabbable>
              ))}
            </div>
          </>
        )}
        <Actions>
          {canRegisterContent ? (
            <Button
              color={colors.green500}
              isLoading={isUpdatingRegistration}
              disabled={!content.rawJSON.main}
              onClick={async () => {
                setIsUpdatingRegistration(true)
                try {
                  await p2p.refreshDrive(encode(content.rawJSON.url))
                  const {
                    metadata: { version }
                  } = await p2p.get(encode(content.rawJSON.url))
                  await p2p.register(
                    [encode(content.rawJSON.url), version].join('+'),
                    profileUrl
                  )
                  if (await ipcRenderer.invoke('getStoreValue', 'vault')) {
                    await archiveModule(`${content.rawJSON.url}+${version}`)
                  }
                  history.replace(
                    `/profiles/${encode(profileUrl)}/${key}/${version}`
                  )
                } finally {
                  setIsUpdatingRegistration(false)
                }
              }}
            >
              Add to profile
            </Button>
          ) : canDeregisterContent ? (
            <Button
              color={colors.yellow500}
              isLoading={isUpdatingRegistration}
              onClick={async () => {
                setIsUpdatingRegistration(true)
                try {
                  await p2p.deregister(
                    [
                      encode(content.rawJSON.url),
                      content.metadata.version
                    ].join('+'),
                    profileUrl
                  )
                  history.replace(`/drafts/${key}`)
                } finally {
                  setIsUpdatingRegistration(false)
                }
              }}
            >
              Remove from profile
            </Button>
          ) : null}
          {content.metadata.isWritable && (
            <Button
              color={colors.red500}
              isLoading={isDeleting}
              onClick={async () => {
                const { response } = await remote.dialog.showMessageBox(
                  remote.getCurrentWindow(),
                  {
                    type: 'warning',
                    buttons: ['Delete files', 'Cancel'],
                    message:
                      'This will also delete these files from your Hypergraph folder. Are you sure you want to delete this content?'
                  }
                )
                if (response === 1) return

                setIsDeleting(true)
                // iff deleteFiles = true local files get deleted
                const deleteFiles = false
                await p2p.delete(content.rawJSON.url, deleteFiles)
                history.push('/')
              }}
            >
              Delete
            </Button>
          )}
        </Actions>
      </Container>
    </>
  ) : null
}

export default Content
