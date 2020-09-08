import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { purple, green } from '../../lib/colors'
import { rgba } from 'polished'
import { Button } from '../layout/grid'
import Arrow from '../icons/arrow-up-2rem.svg'
import { Label } from '../forms/forms'
import TitleInput from '../forms/title-input'
import IllustrationWelcome from './illustrations/welcome.svg'
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
import { ipcRenderer } from 'electron'

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
  filter: brightness(
    ${props =>
      props.page === 0 || props.page === dialogs.length - 1 ? 0 : 100}%
  );
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
  ({ page, next }) => (
    <>
      <Back page={page} />
      <Illustration>
        <IllustrationWelcome />
      </Illustration>
      <Heading>Welcome to Hypergraph</Heading>
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
  ({ page, next, previous }) => (
    <>
      <Back page={page} onClick={previous} />
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
      <Back page={page} onClick={previous} />
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
        <Button emphasis='top' autoFocus color={green}>
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
        <Back page={page} onClick={previous} />
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
  ({ page, next, previous }) => {
    return (
      <>
        <Back page={page} onClick={previous} />
        <Illustration>
          <IllustrationVault />
        </Illustration>
        <Heading>Introducing the Vault</Heading>
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
          Until January 1st, 2021, Hypergraph Vault is free, while we figure out
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
    )
  },
  ({ page, p2p, name, profileUrl, setProfileUrl, previous }) => {
    const [isLoading, setIsLoading] = useState(false)

    return (
      <>
        <Back page={page} />
        <Illustration>
          <IllustrationLibscie />
        </Illustration>
        <Heading>One last thing</Heading>
        <p>
          Liberate Science is on a mission to reset research work. We would love
          it if you'd join us! 💜
        </p>
        <p>
          Read our manifesto. Check out our{' '}
          <Anchor href='https://libscie.org'>website</Anchor>,{' '}
          <Anchor href='https://blog.libscie.org'>blog</Anchor>,{' '}
          <Anchor href='https://twitter.com/libscie'>Twitter</Anchor>, or{' '}
          <Anchor href='https://github.com/hypergraph-xyz/desktop'>
            GitHub
          </Anchor>
          . Sign up for our{' '}
          <Anchor href='https://www.libscie.org/#newsletter'>newsletter</Anchor>{' '}
          or{' '}
          <Anchor href='https://chrishartgerink.typeform.com/to/VNfDMq'>
            testing
          </Anchor>
          . If you're interested in becoming a supporting member, get in touch
          at{' '}
          <Anchor href='mailto:community@libscie.org'>
            community@libscie.org
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

            await ipcRenderer.invoke('setStoreValue', 'welcome', false)
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

const Welcome = ({ p2p, setProfileUrl }) => {
  const [page, setPage] = useState(0)
  const [name, setName] = useState()
  const { url: profileUrl } = useContext(ProfileContext)

  useEffect(() => {
    ;(async () => {
      if (profileUrl) {
        const profile = await p2p.get(profileUrl)
        setName(profile.rawJSON.title)
      }
    })()
  }, [])

  const next = async e => {
    if (e) e.preventDefault()
    setPage(page + 1)
  }
  const previous = () => setPage(page - 1)

  if (!dialogs[page]) return null

  return (
    <Modal overlay={rgba(purple, 0.8)} border={false}>
      {React.createElement(dialogs[page], {
        next,
        previous,
        page,
        name,
        setName,
        p2p,
        profileUrl,
        setProfileUrl
      })}
    </Modal>
  )
}

export default Welcome
