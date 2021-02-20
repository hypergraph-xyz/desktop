import React, { useState, useEffect, useRef, Fragment, useContext } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { colors } from '@libscie/design-library'
import Avatar from '../avatar/avatar'
import ContentRow from '../content/row'
import Footer, { FooterAddContent } from '../footer/footer'
import { encode } from 'dat-encoding'
import { Title, StickyRow, TopRow, Button } from '../layout/grid'
import { Textarea, Input } from '../forms/forms'
import Share from '../icons/share.svg'
import { useParams } from 'react-router-dom'
import ShareModal from './share-modal'
import sort from '../../lib/sort'
import { ProfileContext } from '../../lib/context'
import Loading, { LoadingFlex } from '../loading/loading'
import { cloneMany } from '../../lib/clone-contents'

const Header = styled.div`
  position: relative;
`
const StyledAvatar = styled(Avatar)`
  margin-left: 2rem;
  margin-top: 2rem;
  margin-bottom: 23px;
`
const saved = keyframes`
  0% {
    border-left-color: transparent;
  }
  50% {
    border-left-color: ${colors.green500};
  }
  100% {
    border-left-color: transparent;
  }
`
const Indicator = styled.div`
  border-left: 2px solid transparent;
  height: 45px;
  display: inline-block;
  position: relative;
  left: -0.5rem;
  top: 0.5rem;
  margin-left: -2px;
  transition: border-left-color 1s;

  ${props =>
    props.isEditing &&
    css`
      border-left-color: ${colors.yellow500};
    `}
  ${props =>
    props.isInvalid &&
    css`
      border-left-color: ${colors.red500};
    `}
  ${props =>
    props.isSaving &&
    css`
      border-left-color: transparent;
    `}
  ${props =>
    props.isSaved &&
    css`
      animation: ${saved} 2s linear;
    `}
`
const Description = styled.div`
  position: absolute;
  left: 11rem;
  top: calc(4rem - 4px);
  right: 146px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  border-left: 2px solid transparent;
  padding-left: 0.5rem !important;
  margin-left: calc(-0.5rem - 2px) !important;
  transition: border-left-color 1s;
  ${props =>
    props.isEmpty &&
    css`
      color: ${colors.mono500};
      :hover {
        cursor: text;
      }
    `}
  ${props =>
    props.isEditing &&
    css`
      border-left-color: ${colors.yellow500};
    `}
  ${props =>
    props.isSaving &&
    css`
      border-left-color: transparent;
    `}
  ${props =>
    props.isSaved &&
    css`
      animation: ${saved} 2s linear;
    `}
`
const StyledTextarea = styled(Textarea)`
  height: 4.5rem;
  border: 0;
  padding: 0;
  margin: 0;
  outline: 0;
  resize: none;
`
const Form = styled.form`
  display: flex;
  width: 100%;
`
const StyledInput = styled(Input)`
  margin-bottom: 0;
`

const Profile = ({ p2p }) => {
  const { url: ownProfileUrl } = useContext(ProfileContext)
  const { key = ownProfileUrl } = useParams()
  const [profile, setProfile] = useState()
  const [contents, setContents] = useState()
  const [isEditing, setIsEditing] = useState()
  const [isPopulatingDescription, setIsPopulatingDescription] = useState()
  const [isSaving, setIsSaving] = useState()
  const [isSaved, setIsSaved] = useState()
  const [isTitleInvalid, setIsTitleInvalid] = useState()
  const [isSharing, setIsSharing] = useState()
  const [nameForAvatar, setNameForAvatar] = useState()
  const [ownProfile, setOwnProfile] = useState()
  const titleRef = useRef()
  const descriptionRef = useRef()

  const fetchContents = async profile => {
    const contents = await cloneMany({
      p2p,
      urls: profile.rawJSON.contents
    })
    contents.sort(sort)
    setContents(contents)
  }

  const fetchOwnProfile = async () =>
    setOwnProfile(await p2p.get(ownProfileUrl))

  const onSubmit = async e => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await p2p.set({
        url: profile.rawJSON.url,
        title: titleRef.current.value,
        description: descriptionRef.current.value
      })
    } catch (_) {
      setIsTitleInvalid(true)
      setIsSaving(false)
      setIsEditing(false)
      return
    }
    setIsTitleInvalid(false)
    setIsSaving(false)
    setProfile(await p2p.get(profile.rawJSON.url))
    setIsEditing(false)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
    await fetchContents(profile)
  }

  useEffect(() => {
    ;(async () => {
      setContents(null)
      const profile = await p2p.clone(encode(key), null)
      setProfile(profile)
      setNameForAvatar(profile.rawJSON.title)
      await fetchContents(profile)
    })()
  }, [key])

  useEffect(() => {
    if (!descriptionRef.current) return
    descriptionRef.current.focus()
    setIsPopulatingDescription(false)
  }, [key, isPopulatingDescription])

  useEffect(() => {
    fetchOwnProfile()
  }, [])

  if (!profile) return null

  return (
    <>
      {isSharing && (
        <ShareModal
          url={profile.rawJSON.url}
          onClose={() => setIsSharing(false)}
        />
      )}
      <TopRow>
        <Form onSubmit={onSubmit}>
          <Title>
            <Indicator
              isEditing={isEditing}
              isSaving={isSaving}
              isSaved={isSaved}
              isInvalid={isTitleInvalid}
            />
            {isEditing ? (
              <StyledInput
                ref={titleRef}
                defaultValue={profile.rawJSON.title}
                onChange={e => {
                  setIsTitleInvalid(
                    e.target.value.length === 0 || e.target.value.length > 300
                  )
                  setNameForAvatar(e.target.value)
                }}
              />
            ) : (
              profile.rawJSON.title
            )}
          </Title>
          {(() => {
            if (profile.metadata.isWritable || !ownProfile) return
            const follows = ownProfile.rawJSON.follows.find(
              url => encode(url) === encode(profile.rawJSON.url)
            )
            return follows ? (
              <Button
                type='button'
                onClick={async () => {
                  await p2p.unfollow(
                    encode(ownProfile.rawJSON.url),
                    encode(profile.rawJSON.url)
                  )
                  await fetchOwnProfile()
                }}
              >
                Unfollow
              </Button>
            ) : (
              <Button
                type='button'
                onClick={async () => {
                  await p2p.follow(
                    encode(ownProfile.rawJSON.url),
                    encode(profile.rawJSON.url)
                  )
                  await fetchOwnProfile()
                }}
              >
                Follow
              </Button>
            )
          })()}
          <Button
            content='icon'
            type='button'
            onClick={() => setIsSharing(true)}
          >
            <Share />
          </Button>
          {isEditing ? (
            <>
              <Button color={colors.green500} disabled={isTitleInvalid}>
                Save
              </Button>
              <Button
                color={colors.red500}
                onClick={() => {
                  setNameForAvatar(profile.rawJSON.title)
                  setIsTitleInvalid(false)
                  setIsEditing(false)
                  setIsTitleInvalid(false)
                }}
              >
                Cancel
              </Button>
            </>
          ) : profile.metadata.isWritable ? (
            <Button
              type='button'
              color={colors.green500}
              onClick={() => setIsEditing(true)}
            >
              Edit profile
            </Button>
          ) : null}
        </Form>
      </TopRow>
      <Header>
        <StyledAvatar name={nameForAvatar} />
        <Description
          isEditing={isEditing}
          isSaving={isSaving}
          isSaved={isSaved}
          isEmpty={profile.rawJSON.description.length === 0}
          onClick={() => {
            if (
              profile.metadata.isWritable &&
              profile.rawJSON.description.length === 0 &&
              !isEditing
            ) {
              setIsEditing(true)
              setIsPopulatingDescription(true)
            }
          }}
        >
          {isEditing ? (
            <StyledTextarea
              ref={descriptionRef}
              defaultValue={profile.rawJSON.description}
            />
          ) : profile.rawJSON.description ? (
            profile.rawJSON.description.split('\n').map((line, index) => (
              <Fragment key={index}>
                {line}
                <br />
              </Fragment>
            ))
          ) : profile.metadata.isWritable ? (
            'Add a description…'
          ) : null}
        </Description>
      </Header>
      <StickyRow top='114px'>
        <Title>Content</Title>
      </StickyRow>
      {contents ? (
        <>
          {contents.map(content => {
            return content.rawJSON.title ? (
              <ContentRow
                key={`${content.rawJSON.url}+${content.metadata.version}`}
                p2p={p2p}
                content={content}
                to={`/profiles/${encode(profile.rawJSON.url)}/${encode(
                  content.rawJSON.url
                )}/${content.metadata.version}`}
                isRegistered
              />
            ) : (
              <ContentRow
                key={`${content.rawJSON.url}+${content.metadata.version}`}
              />
            )
          })}
          <Footer
            title={
              <>
                {contents.length ? (
                  'You’ve reached the end! ✌️'
                ) : (
                  <>
                    No content yet, use <FooterAddContent /> to add something!
                  </>
                )}
              </>
            }
          />
        </>
      ) : (
        <LoadingFlex>
          <Loading />
        </LoadingFlex>
      )}
    </>
  )
}

export default Profile
