import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import Layout from './components/layout/layout'
import Profile from './components/profile/profile'
import ProfileContent from './components/profile/content'
import Welcome from './components/welcome/welcome'
import Drafts from './components/drafts/drafts'
import ShowDraft from './components/drafts/show'
import CreateContent from './components/content/create'
import EditContent from './components/content/edit'
import Following from './components/profile/following'
import ShowContent from './components/content/show'
import Feed from './components/feed/feed'
import Discover from './components/discover/discover'
import P2P from '@p2pcommons/sdk-js'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import { shell, remote, ipcRenderer } from 'electron'
import { ProfileContext } from './lib/context'
import FindModal from './components/modal/find-modal'
import { archiveModule } from './lib/vault'
import analytics from './lib/analytics'

const handleError = err => {
  analytics.trackEvent('Error', err.message, err.stack)
  window.alert(
    'An unknown error has happened.\n\n' +
      'Please send a screenshot of this window alongside a description of what ' +
      'you were doing to feedback@libscie.org.\n\n' +
      err.stack
  )
}

if (remote.app.isPackaged) {
  window.onerror = (_, __, ___, ____, err) => handleError(err)
  window.onunhandledrejection = ev => handleError(ev.reason)
}

const p2p = new P2P({
  baseDir: !remote.app.isPackaged
    ? `${remote.app.getPath('home')}/.p2pcommons-dev`
    : undefined
})
window.addEventListener('beforeunload', () => p2p.destroy())
p2p.on('download-resume', key => console.log('download-resume', key))
p2p.on('download-started', () => console.log('download-started'))
p2p.on('download-progress', ({ key }) => console.log('download-progress', key))
p2p.on('download-drive-completed', key => console.log('download-complete', key))

ipcRenderer.on('export graph', async () => {
  const [profiles, contents] = await Promise.all([
    p2p.listProfiles(),
    p2p.listContent()
  ])
  const graph = {
    nodes: [
      ...profiles.map(module => ({
        url: module.rawJSON.url,
        type: module.rawJSON.type,
        subtype: module.rawJSON.subtype
      })),
      ...contents.map(module => ({
        url: `${module.rawJSON.url}+${module.metadata.version}`,
        type: module.rawJSON.type,
        subtype: module.rawJSON.subtype
      }))
    ],
    edges: [
      ...profiles
        .map(profile => [
          ...profile.rawJSON.contents.map(url => ({
            source: profile.rawJSON.url,
            target: `hyper://${url}`
          })),
          ...profile.rawJSON.follows.map(url => ({
            source: profile.rawJSON.url,
            target: `hyper://${url}`
          }))
        ])
        .flat(),
      ...contents
        .map(content => [
          ...content.rawJSON.parents.map(url => ({
            source: `${content.rawJSON.url}+${content.metadata.version}`,
            target: `hyper://${url}`
          })),
          ...content.rawJSON.authors.map(url => ({
            source: `${content.rawJSON.url}+${content.metadata.version}`,
            target: `hyper://${url}`
          }))
        ])
        .flat()
    ]
  }
  const nodesByUrl = {}
  for (const node of graph.nodes) {
    nodesByUrl[node.url] = node
  }
  for (const edge of graph.edges) {
    const urls = [edge.source, edge.target]
    for (const url of urls) {
      if (!nodesByUrl[url]) {
        const [key, version] = url.split('+')
        const module = await p2p.clone(key, version)
        const node = {
          url,
          type: module.rawJSON.type,
          subtype: module.rawJSON.subtype
        }
        nodesByUrl[url] = node
        graph.nodes.push(node)
      }
    }
  }
  ipcRenderer.send('export graph', graph)
})

ipcRenderer.on('goto-create', () => {
  window.location = '#/create'
})

const Container = ({ children, onFind, profileUrl }) => (
  <ProfileContext.Provider value={{ url: profileUrl }}>
    <Router>
      <Layout onFind={onFind} p2p={p2p}>
        {children}
      </Layout>
    </Router>
  </ProfileContext.Provider>
)

const lastArg = remote.process.argv[remote.process.argv.length - 1]

const App = () => {
  const [profileUrl, setProfileUrl] = useState()
  const [loading, setLoading] = useState(true)
  const [findModalUrl, setFindModalUrl] = useState(
    /^hypergraph:\/\//.test(lastArg) ? lastArg : null
  )
  const [isFinding, setIsFinding] = useState(Boolean(findModalUrl))
  const [showWelcome, setShowWelcome] = useState()

  useEffect(() => {
    ;(async () => {
      setShowWelcome(await ipcRenderer.invoke('getStoreValue', 'showWelcome'))
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      const profiles = await p2p.listProfiles()
      const profile = profiles.find(profile => profile.metadata.isWritable)
      if (profile) {
        setProfileUrl(profile.rawJSON.url)
        if (window.Chatra) {
          window.Chatra('updateIntegrationData', {
            name: profile.rawJSON.title
          })
        }
      }
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    ipcRenderer.on('open', (_, url) => {
      setFindModalUrl(url)
      setIsFinding(true)
    })
  }, [])

  useEffect(() => {
    const onChange = async (_, isEnabled) => {
      if (!isEnabled || !profileUrl) return
      const profile = await p2p.get(profileUrl)
      const urls = [
        profile.rawJSON.url,
        ...profile.rawJSON.contents.map(url => `hyper://${url}`)
      ]
      console.log(`archiving ${urls.length} modules`)
      for (const url of urls) await archiveModule(url)
    }
    ipcRenderer.on('vault', onChange)
    return () => {
      ipcRenderer.removeListener('vault', onChange)
    }
  }, [profileUrl])

  useEffect(() => {
    ipcRenderer.on('showWelcome', (_, showWelcome) => {
      setShowWelcome(showWelcome)
    })
  }, [])

  return loading ? (
    <Container />
  ) : !profileUrl || showWelcome ? (
    <Container profileUrl={profileUrl}>
      <Welcome p2p={p2p} setProfileUrl={setProfileUrl} />
    </Container>
  ) : (
    <Container profileUrl={profileUrl} onFind={() => setIsFinding(true)}>
      {isFinding && (
        <FindModal
          p2p={p2p}
          onClose={() => {
            setIsFinding(false)
            setFindModalUrl()
          }}
          prefilledUrl={findModalUrl}
        />
      )}
      <Switch>
        <Route path='/' exact>
          <Feed p2p={p2p} />
        </Route>
        <Route path='/drafts' exact>
          <Drafts p2p={p2p} />
        </Route>
        <Route path='/drafts/:key'>
          <ShowDraft p2p={p2p} />
        </Route>
        <Route path='/create/:parentUrl?'>
          <CreateContent p2p={p2p} />
        </Route>
        <Route path='/edit/:key/:version'>
          <EditContent p2p={p2p} />
        </Route>
        <Route path='/profiles/:profileKey/:contentKey/:version'>
          <ProfileContent p2p={p2p} />
        </Route>
        <Route path='/profiles/:key'>
          <Profile p2p={p2p} />
        </Route>
        <Route path='/profile'>
          <Profile p2p={p2p} />
        </Route>
        <Route path='/following'>
          <Following p2p={p2p} />
        </Route>
        <Route path='/contents/:key/:version?'>
          <ShowContent p2p={p2p} />
        </Route>
        <Route path='/discover'>
          <Discover p2p={p2p} />
        </Route>
      </Switch>
    </Container>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

document.body.addEventListener('click', event => {
  const externalOpen = new RegExp(/^https?:\/\/(?!localhost:1212)/)
  if (event.target.href && externalOpen.test(event.target.href)) {
    event.preventDefault()
    shell.openExternal(event.target.href)
  }
})
