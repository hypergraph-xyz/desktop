import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import Layout from './components/layout/layout'
import Profile from './components/profile/profile'
import ProfileContent from './components/profile/content'
import Welcome from './components/welcome/welcome'
import Drafts from './components/drafts/drafts'
import DraftContent from './components/drafts/content'
import Create from './components/create/create'
import P2P from '@p2pcommons/sdk-js'
import { HashRouter as Router, Switch, Route } from 'react-router-dom'
import { remote } from 'electron'

const showError = err => {
  if (err instanceof P2P.errors.EBUSYError) return
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

const Container = ({ children }) => (
  <Router>
    <Layout>{children}</Layout>
  </Router>
)

const App = () => {
  const [profile, setProfile] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const profiles = await p2p.listProfiles()
      const profile = profiles.find(profile => profile.metadata.isWritable)
      if (profile) setProfile(profile)
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    window.Chatra('updateIntegrationData', {
      name: profile ? profile.rawJSON.title : null
    })
  }, [profile])

  if (loading) return <Container />
  if (!profile) {
    return (
      <Container>
        <Welcome p2p={p2p} setProfile={setProfile} />
      </Container>
    )
  }

  return (
    <Container>
      <Switch>
        <Route path='/' exact>
          <Drafts p2p={p2p} profile={profile} />
        </Route>
        <Route path='/content/:key'>
          <DraftContent p2p={p2p} profile={profile} setProfile={setProfile} />
        </Route>
        <Route path='/create/:parentUrl?'>
          <Create p2p={p2p} profile={profile} />
        </Route>
        <Route path='/profile' exact>
          <Profile p2p={p2p} profile={profile} setProfile={setProfile} />
        </Route>
        <Route path='/profile/:key'>
          <ProfileContent p2p={p2p} profile={profile} setProfile={setProfile} />
        </Route>
      </Switch>
    </Container>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
