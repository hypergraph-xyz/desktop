import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { rgba } from 'polished'
import { colors } from '@libscie/design-library'
import { Button } from '../layout/grid'
import Arrow from '../icons/arrow-up-2rem.svg'
import { Label, Checkbox } from '../forms/forms'
import TitleInput from '../forms/title-input'
import IllustrationWelcome from './illustrations/welcome.svg'
import IllustrationKeyBackup from './illustrations/key-backup.svg'
import IllustrationAsYouGo from './illustrations/as-you-go.svg'
import IllustrationAsYouGo2 from './illustrations/as-you-go-2.svg'
import IllustrationProfileCreation from './illustrations/profile-creation.svg'
import IllustrationVault from './illustrations/vault.svg'
import IllustrationLibscie from './illustrations/libscie.svg'
import Modal from '../modal/modal'
import Avatar from '../avatar/avatar'
import { archiveModule } from '../../lib/vault'
import Anchor from '../anchor'
import { ProfileContext } from '../../lib/context'
import { remote, ipcRenderer } from 'electron'
import TermsOfUse from './terms-of-use'
import { productName } from '../../../package'

const { FormData } = window

const Illustration = styled.div`
  margin-top: 22px;
  margin-bottom: 32px;
  width: 100%;
  height: 188px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`
const Heading = styled.div`
  font-size: 32px;
  line-height: 37px;
  margin-bottom: 24px;
`
const Back = styled(Arrow)`
  transform: rotate(270deg);
  filter: brightness(${props => (props.onClick ? 100 : 0)}%);
`
const Form = styled.form`
  position: absolute;
  bottom: 32px;
  left: 32px;
  right: 32px;
`
const StyledAvatar = styled(Avatar)`
  position: absolute;
  svg {
    transform: scale(0.78);
  }
`
const ButtonGroup = styled.div`
  display: flex;
  align-items: baseline;
`

const dialogs = [
  ({ next }) => (
    <>
      <TermsOfUse />
      <Form
        onSubmit={async ev => {
          ev.preventDefault()
          const data = new FormData(ev.target)
          await ipcRenderer.invoke(
            'setStoreValue',
            'analytics',
            Boolean(data.get('analytics'))
          )
          await ipcRenderer.invoke('setStoreValue', 'chatra', true)
          await ipcRenderer.invoke('setStoreValue', 'showTerms', false)
          await ipcRenderer.invoke(
            'setStoreValue',
            'lastInstalledAppVersion',
            remote.app.getVersion()
          )

          next()
        }}
      >
        <ButtonGroup>
          <Button emphasis='top' autoFocus>
            Agree
          </Button>
          <Checkbox name='analytics' />
          Allow analytics to be sent to Liberate Science GmbH
        </ButtonGroup>
      </Form>
    </>
  ),
  ({ page, next }) => (
    <>
      <Back />
      <Illustration>
        <IllustrationWelcome />
      </Illustration>
      <Heading>Welcome to {productName}</Heading>
      <p>
        At <Anchor href='https://libscie.org'>Liberate Science</Anchor>, we
        reinvent the publication process in a way that empowers you to do better
        research. Research that is transparent and accessible to everyone, free
        from time-consuming bureaucracy and centralized control.
      </p>
      <p>
        Let us explain some of the basic concepts of Hypergraph before you get
        started...
      </p>
      <Form onSubmit={next}>
        <Button emphasis='top' autoFocus>
          Next
        </Button>
      </Form>
    </>
  ),
  ({ page, next, p2p, name, profileUrl, setProfileUrl, previous }) => {
    const [isLoading, setIsLoading] = useState(false)

    return (
      <>
        <Back />
        <Illustration>
          <IllustrationKeyBackup />
        </Illustration>
        <Heading>Here's your key</Heading>
        <p>
          Just like your house has a key, Hypergraph has a key. You need to keep
          your Hypergraph key secure.
        </p>
        <p>
          Create a copy, store it safely, so that if you lose your device you
          can recover your account. We cannot recover your keys for you ---
          they're that private.
        </p>
        <p>Bonus? No need to remember yet another password.</p>
        <Form
          onSubmit={async e => {
            e.preventDefault()
            setIsLoading(true)

            const copied = await ipcRenderer.invoke('copyPrivateKey')
            if (!copied) {
              setIsLoading(false)
              return
            }

            next()
          }}
        >
          <Button emphasis='top' autoFocus isLoading={isLoading}>
            Copy your key
          </Button>
        </Form>
      </>
    )
  },
  ({ page, next, previous }) => (
    <>
      <Back onClick={previous} />
      <Illustration>
        <IllustrationAsYouGo />
      </Illustration>
      <Heading>As-you-go, not after-the-fact</Heading>
      <p>
        You are probably used to doing research, writing a full paper, and then
        going through the laborious process of getting accepted by a journal.
        With Hypergraph, you can publish each step of your research as-you-go.
      </p>
      <p>
        As-you-go publishing increases the value of your work by making it
        available to others as soon as you feel ready. It also breaks down the
        research process into bite-size chunks. 🍰
      </p>
      <Form onSubmit={next}>
        <Button emphasis='top' autoFocus>
          Next
        </Button>
      </Form>
    </>
  ),
  ({ page, next, previous }) => (
    <>
      <Back onClick={previous} />
      <Illustration>
        <IllustrationAsYouGo2 />
      </Illustration>
      <Heading>How Hypergraph works</Heading>
      <p>
        Each step of your research is its own publication, whether it's a
        proposal, a literature study, a data set, or a conclusion. You link them
        together as you go along, to create a connected body of work.
      </p>
      <p>
        This makes it much easier to do replications or multiple interpretations
        with the same source material - even if someone else created it. You
        just link your content to the existing content and there you go! 🌈
      </p>
      <Form onSubmit={next}>
        <Button emphasis='top' autoFocus color={colors.green500}>
          Create Profile
        </Button>
      </Form>
    </>
  ),
  ({ page, next, previous, name, setName }) => {
    const [isValid, setIsValid] = useState(Boolean(name))
    const [nameForAvatar, setNameForAvatar] = useState(name)

    return (
      <>
        <Back onClick={previous} />
        <Illustration>
          <IllustrationProfileCreation />
          <StyledAvatar name={nameForAvatar} />
        </Illustration>
        <Heading>What should we call you?</Heading>
        <p>
          Time to create a profile! This is where your published work is
          displayed. You can share your profile with others to show them your
          research.
        </p>
        <p>Now, what name should we display on your work?</p>
        <Form
          onSubmit={e => {
            e.preventDefault()
            setName(e.target.title.value)
            next()
          }}
        >
          <Label htmlFor='name'>Name (required)</Label>
          <TitleInput
            placeholder='Name...'
            onIsValid={setIsValid}
            autoFocus
            defaultValue={name}
            onChange={e => setNameForAvatar(e.target.value)}
          />
          <Button emphasis='top' autoFocus disabled={!isValid}>
            Next
          </Button>
        </Form>
      </>
    )
  },
  ({ page, next, previous }) => (
    <>
      <Back onClick={previous} />
      <Illustration>
        <IllustrationVault />
      </Illustration>
      <Heading>Introducing Hypergraph Vault</Heading>
      <p>
        We do not want to be gatekeepers. We chose peer-to-peer technology so
        you can be in control of your work. You help to power the network by
        providing the content you have to other users.
      </p>
      <p>
        Hypergraph Vault is our storage service that makes your work available
        even when your computer is offline. Plus, we're working with libraries
        to archive it for future generations! 👵🏾👨🏻👶
      </p>
      <p>
        Until January 1st, 2022, Hypergraph Vault is free, while we figure out
        the costs.
      </p>
      <Form
        onSubmit={async ev => {
          ev.preventDefault()
          await ipcRenderer.invoke('setStoreValue', 'vault', true)
          next()
        }}
      >
        <ButtonGroup>
          <Button emphasis='top' autoFocus>
            Enable Hypergraph Vault
          </Button>
          <Anchor
            onClick={async () => {
              await ipcRenderer.invoke('setStoreValue', 'vault', false)
              next()
            }}
          >
            Skip for now...
          </Anchor>
        </ButtonGroup>
      </Form>
    </>
  ),
  ({ page, p2p, name, profileUrl, setProfileUrl, previous }) => {
    const [isLoading, setIsLoading] = useState(false)

    return (
      <>
        <Back />
        <Illustration>
          <IllustrationLibscie />
        </Illustration>
        <Heading>One last thing</Heading>
        <p>
          Liberate Science is on a mission to reset research work. We would love
          it if you'd join us! 💜
        </p>
        <p>
          Read our{' '}
          <Anchor href='https://blog.libscie.org/liberate-science-manifesto/'>
            manifesto
          </Anchor>
          . Check out our <Anchor href='https://libscie.org'>website</Anchor>,{' '}
          <Anchor href='https://blog.libscie.org'>blog</Anchor>,{' '}
          <Anchor href='https://twitter.com/libscie'>Twitter</Anchor>, or{' '}
          <Anchor href='https://github.com/hypergraph-xyz/desktop'>
            GitHub
          </Anchor>
          . Sign up for our{' '}
          <Anchor href='https://www.libscie.org/#newsletter'>newsletter</Anchor>{' '}
          or <Anchor href='https://forms.gle/YrQpmWYdQ7KdMoH18'>testing</Anchor>
          . Want to financially support us? Become a{' '}
          <Anchor href='https://blog.libscie.org/p/6569c48c-7f53-4c63-ab68-e654a54abe96/'>
            supporting member
          </Anchor>
          .
        </p>
        <p>We're in the chat any time if you'd like to talk! 💬</p>
        <Form
          onSubmit={async e => {
            e.preventDefault()
            setIsLoading(true)

            if (profileUrl) {
              await p2p.set({
                url: profileUrl,
                title: name
              })
            } else {
              console.time('init profile')
              const profile = await p2p.init({ type: 'profile', title: name })
              console.timeEnd('init profile')
              if (await ipcRenderer.invoke('getStoreValue', 'vault')) {
                await archiveModule(profile.rawJSON.url)
              }
              setProfileUrl(profile.rawJSON.url)
            }

            await ipcRenderer.invoke('setStoreValue', 'showWelcome', false)
          }}
        >
          <Button emphasis='top' autoFocus isLoading={isLoading}>
            Let's get started!
          </Button>
        </Form>
      </>
    )
  }
]

const Welcome = ({ p2p, start, setProfileUrl }) => {
  const { url: profileUrl } = useContext(ProfileContext)
  const [page, setPage] = useState(profileUrl ? 1 : 0)
  const [name, setName] = useState()
  const [skip, setSkip] = useState(false)

  useEffect(() => {
    ;(async () => {
      if (profileUrl) {
        const profile = await p2p.get(profileUrl)
        setName(profile.rawJSON.title)
      }
      if (await ipcRenderer.invoke('getStoreValue', 'showTerms')) {
        setPage(0)
        setSkip(true)
      }

      if (
        !(await ipcRenderer.invoke('getStoreValue', 'showTerms')) &&
        (await ipcRenderer.invoke('getStoreValue', 'keyBackedUp'))
      ) {
        setPage(3)
      }
    })()
  }, [])

  const next = async e => {
    if (e) e.preventDefault()
    if (skip) {
      setPage(page + dialogs.length - 1)
    } else {
      setPage(page + 1)
    }
  }
  const previous = () => setPage(page - 1)

  if (!dialogs[page]) return null

  return (
    <Modal overlay={rgba(colors.purple500, 0.8)} border={false}>
      {React.createElement(dialogs[page], {
        next,
        previous,
        page,
        name,
        skip,
        setName,
        p2p,
        profileUrl,
        setProfileUrl
      })}
    </Modal>
  )
}

export default Welcome
