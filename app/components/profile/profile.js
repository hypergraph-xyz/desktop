import React, { useState, useEffect, useRef, Fragment } from 'react'
import styled, { css, keyframes } from 'styled-components'
import Avatar from '../avatar/avatar'
import ContentRow from '../content/row'
import Footer from '../footer/footer'
import { encode } from 'dat-encoding'
import { Title, StickyRow, TopRow, Button } from '../layout/grid'
import { green, red, yellow, gray } from '../../lib/colors'
import { Textarea, Input } from '../forms/forms'
import Share from './share.svg'
import { useParams } from 'react-router-dom'
import ShareModal from './share-modal'

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
    border-left-color: ${green};
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
      border-left-color: ${yellow};
    `}
  ${props =>
    props.isInvalid &&
    css`
      border-left-color: ${red};
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
  top: calc(2rem - 4px);
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
      color: ${gray};
      :hover {
        cursor: text;
      }
    `}
  ${props =>
    props.isEditing &&
    css`
      border-left-color: ${yellow};
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

const Profile = ({ p2p }) => {
  const { key } = useParams()
  const [profile, setProfile] = useState()
  const [contents, setContents] = useState()
  const [isEditing, setIsEditing] = useState()
  const [isPopulatingDescription, setIsPopulatingDescription] = useState()
  const [isSaving, setIsSaving] = useState()
  const [isSaved, setIsSaved] = useState()
  const [isTitleInvalid, setIsTitleInvalid] = useState()
  const [isSharing, setIsSharing] = useState()
  const [nameForAvatar, setNameForAvatar] = useState()
  const titleRef = useRef()
  const descriptionRef = useRef()

  const fetchContents = async profile => {
    console.time('fetch contents')
    const contents = await Promise.all(
      profile.rawJSON.contents.map(url => {
        const [key, version] = url.split('+')
        const download = true
        return p2p.clone(key, version, download)
      })
    )
    setContents(contents)
    console.timeEnd('fetch contents')
  }

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
      const profile = await p2p.clone(key, null, false /* download */)
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
              <Input
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
          <Button
            content='icon'
            type='button'
            onClick={() => setIsSharing(true)}
          >
            <Share />
          </Button>
          {isEditing ? (
            <>
              <Button color={green} disabled={isTitleInvalid}>
                Save
              </Button>
              <Button
                color={red}
                onClick={() => {
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
              color={green}
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
      {contents && (
        <>
          {contents.map(content => {
            return (
              <ContentRow
                key={content.rawJSON.url}
                p2p={p2p}
                content={content}
                to={`/profile/${encode(profile.rawJSON.url)}/${encode(
                  content.rawJSON.url
                )}`}
              />
            )
          })}
          <Footer
            title={
              contents.length
                ? 'You’ve reached the end! ✌️'
                : 'No content yet... 🤔'
            }
          />
        </>
      )}
    </>
  )
}

export default Profile
