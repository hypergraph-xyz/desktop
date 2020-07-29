import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import Layout from './components/layout/layout'
import Profile from './components/profile/profile'
import ProfileContent from './components/profile/content'
import Welcome from './components/welcome/welcome'
import Drafts from './components/drafts/drafts'
import ShowDraft from './components/drafts/show'
import CreateContent from './components/content/create'
import Following from './components/profile/following'
import ShowContent from './components/content/show'
import Feed from './components/feed/feed'
import P2P from '@p2pcommons/sdk-js'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import { remote } from 'electron'
import { ProfileContext } from './lib/context'

const showError = err => {
  window.alert(
    'An unknown error has happened.\n\n' +
      'Please send a screenshot of this window alongside a description of what ' +
      'you were doing to feedback@libscie.org.\n\n' +
      err.stack
  )
}

if (remote.app.isPackaged) {
  window.onerror = (_, __, ___, ____, err) => showError(err)
  window.onunhandledrejection = ev => showError(ev.reason)
}

const p2p = new P2P()
window.addEventListener('beforeunload', () => p2p.destroy())

const Container = ({ children }) => (
  <Router>
    <Layout p2p={p2p}>{children}</Layout>
  </Router>
)

const App = () => {
  const [profileUrl, setProfileUrl] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const profiles = await p2p.listProfiles()
      const profile = profiles.find(profile => profile.metadata.isWritable)
      if (profile) {
        setProfileUrl(profile.rawJSON.url)
        window.Chatra('updateIntegrationData', {
          name: profile.rawJSON.title
        })
      }
      setLoading(false)
    })()
  }, [])

  if (loading) return <Container />
  if (!profileUrl) {
    return (
      <Container>
        <Welcome p2p={p2p} setProfileUrl={setProfileUrl} />
      </Container>
    )
  }

  return (
    <ProfileContext.Provider value={{ url: profileUrl }}>
      <Container>
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
          <Route path='/profiles/:profileKey/:contentKey'>
            <ProfileContent p2p={p2p} />
          </Route>
          <Route path='/following'>
            <Following p2p={p2p} />
          </Route>
          <Route path='/profiles/:key'>
            <Profile p2p={p2p} />
          </Route>
          <Route path='/contents/:key/:version?'>
            <ShowContent p2p={p2p} />
          </Route>
        </Switch>
      </Container>
    </ProfileContext.Provider>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
