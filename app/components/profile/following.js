import React, { useState, useEffect, useContext } from 'react'
import styled from 'styled-components'
import { TopRow, Row, Title, Button } from '../layout/grid'
import { ProfileContext } from '../../lib/context'
import { Heading3 } from '../typography'
import Avatar from '../avatar/avatar'
import { useHistory } from 'react-router-dom'
import { encode } from 'dat-encoding'
import Footer, { FooterSearch } from '../footer/footer'
import Tabbable from '../accessibility/tabbable'

const StyledButton = styled(Button)`
  display: none;
  ${Row}:hover & {
    display: block;
  }
`
const Profile = styled.span`
  display: flex;
  align-items: center;
  flex-grow: 1;
  height: 100%;
  cursor: pointer;
`
const StyledAvatar = styled(Avatar)`
  margin-left: 2rem;
  margin-right: 1rem;
  div {
    font-size: 1rem;
  }
`

const Following = ({ p2p }) => {
  const [following, setFollowing] = useState()
  const [unfollowed, setUnfollowed] = useState({})
  const { url: profileUrl } = useContext(ProfileContext)
  const history = useHistory()

  useEffect(() => {
    ;(async () => {
      const profiles = await Promise.all(
        (await p2p.get(profileUrl)).rawJSON.follows.map(key =>
          p2p.clone(encode(key))
        )
      )
      setFollowing(
        profiles.sort((a, b) => a.rawJSON.title.localeCompare(b.rawJSON.title))
      )
    })()
  }, [])

  return (
    <>
      <TopRow>
        <Title>Following</Title>
      </TopRow>
      {following && (
        <>
          {following.map(profile => {
            const url = `/profiles/${encode(profile.rawJSON.url)}`
            return (
              <Row noBorderTop key={profile.rawJSON.url}>
                <Tabbable component={Profile} onClick={() => history.push(url)}>
                  <StyledAvatar name={profile.rawJSON.title} size='40px' />
                  <Heading3>{profile.rawJSON.title}</Heading3>
                </Tabbable>
                {unfollowed[profile.rawJSON.url] ? (
                  <StyledButton
                    onClick={async () => {
                      setUnfollowed({
                        ...unfollowed,
                        [profile.rawJSON.url]: false
                      })
                      await p2p.follow(
                        encode(profileUrl),
                        encode(profile.rawJSON.url)
                      )
                    }}
                  >
                    Follow
                  </StyledButton>
                ) : (
                  <StyledButton
                    onClick={async () => {
                      setUnfollowed({
                        ...unfollowed,
                        [profile.rawJSON.url]: true
                      })
                      await p2p.unfollow(
                        encode(profileUrl),
                        encode(profile.rawJSON.url)
                      )
                    }}
                  >
                    Unfollow
                  </StyledButton>
                )}
              </Row>
            )
          })}
          <Footer
            title={
              <>
                {following.length ? (
                  'You’ve reached the end! ✌️'
                ) : (
                  <>
                    You’re not following anybody yet. Use <FooterSearch /> Find
                    to look up a profile
                  </>
                )}
              </>
            }
          />
        </>
      )}
    </>
  )
}

export default Following
