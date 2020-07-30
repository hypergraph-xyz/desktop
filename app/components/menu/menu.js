import React, { useContext } from 'react'
import styled from 'styled-components'
import Logo from './logo.svg'
import { white, purple, black } from '../../lib/colors'
import { Row, Button } from '../layout/grid'
import { NavLink, useHistory, Link } from 'react-router-dom'
import AddContent from '../icons/add-content.svg'
import Search from './search-icon-1rem.svg'
import { encode } from 'dat-encoding'
import { ProfileContext } from '../../lib/context'

const Container = styled.div`
  width: 8rem;
  border-right: 2px solid ${purple};
  padding-top: 3rem;
  position: fixed;
  height: 100%;
  top: 0;
  text-align: center;
  box-sizing: border-box;
`
const StyledLogo = styled(Logo)`
  margin-bottom: 2rem;
  -webkit-app-region: drag;
`
const StyledRow = styled(Row)`
  text-align: left;
  display: block;
`
const StyledButton = styled(Button)`
  color: ${white};
  background-color: ${black};
  text-align: left;
  width: 100%;
  padding-left: 12.5%;
  border-left-width: 0;
  border-top-width: 0;
  :hover {
    background-color: ${purple};
  }
  display: block;
  border-right-width: 2px !important;
  border-bottom-width: 2px !important;

  .active > & {
    background-color: ${purple};
    :active {
      background-color: ${purple};
      color: ${white};
    }
  }
  :active {
    background-color: ${black};
    color: ${white} !important;
  }
`
const StyledNavLink = styled(NavLink)`
  text-decoration: none;
`
const AddContentLink = styled(Link)`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 8rem;
  width: 8rem;
  display: flex;
  align-items: center;
  justify-content: center;

  :hover {
    background-color: ${purple};
    cursor: default;
  }
  :active {
    background-color: inherit;
  }
`
const FindButton = styled(StyledButton)`
  position: absolute;
  bottom: 8rem;
  left: 0;
  height: 2rem;
  border-top-width: 2px;
`
const StyledSearch = styled(Search)`
  margin-right: 0.5rem;
`

const Menu = ({ onFind }) => {
  const history = useHistory()
  const { url: profileUrl } = useContext(ProfileContext)

  return (
    <Container>
      <StyledLogo onClick={() => history.push('/')} />
      <StyledRow>
        <StyledNavLink to='/' exact>
          <StyledButton>Feed</StyledButton>
        </StyledNavLink>
        <StyledNavLink to='/drafts'>
          <StyledButton>Drafts</StyledButton>
        </StyledNavLink>
        <StyledNavLink to={`/profiles/${profileUrl ? encode(profileUrl) : ''}`}>
          <StyledButton>Profile</StyledButton>
        </StyledNavLink>
        <StyledNavLink to='/following'>
          <StyledButton>Following</StyledButton>
        </StyledNavLink>
      </StyledRow>
      <FindButton onClick={onFind}>
        <StyledSearch />
        Find
      </FindButton>
      <AddContentLink to='/create'>
        <AddContent />
      </AddContentLink>
    </Container>
  )
}

export default Menu
