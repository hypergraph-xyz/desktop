import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { colors } from '@libscie/design-library'
import Logo from './logo.svg'
import { Row, Button } from '../layout/grid'
import { NavLink, useHistory, Link } from 'react-router-dom'
import AddContent from '../icons/add-content.svg'
import Search from '../icons/search-icon-1rem.svg'
import NetworkStatusRed from './network-status-red.svg'
import NetworkStatusYellow from './network-status-yellow.svg'
import NetworkStatusGreen from './network-status-green.svg'
import isOnline from 'is-online'
import DevMode from '../icons/dev-mode.svg'
import { remote } from 'electron'

const Container = styled.div`
  width: 8rem;
  border-right: 2px solid ${colors.purple500};
  padding-top: 3rem;
  position: fixed;
  height: 100%;
  top: 0;
  text-align: center;
  box-sizing: border-box;
  -webkit-app-region: drag;
`
const StyledDevMode = styled(DevMode)`
  position: relative;
`
const StyledLogo = styled(Logo)`
  margin-bottom: 2rem;
  -webkit-app-region: drag;
  position: relative;
  z-index: 1;
`
const StyledRow = styled(Row)`
  text-align: left;
  display: block;
`
const StyledButton = styled(Button)`
  color: ${colors.white};
  background-color: ${colors.mono900};
  text-align: left;
  width: 100%;
  padding-left: 12.5%;
  border-left-width: 0;
  border-top-width: 0;
  :hover {
    background-color: ${colors.purple500};
  }
  display: block;
  border-right-width: 2px !important;
  border-bottom-width: 2px !important;

  &.active {
    background-color: ${colors.purple500};
    :active {
      background-color: ${colors.purple500};
      color: ${colors.white};
    }
  }
  :active {
    background-color: ${colors.mono900};
    color: ${colors.white} !important;
  }
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
  -webkit-user-drag: none;

  :hover {
    background-color: ${colors.purple500};
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
const NetworkStatusContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 8rem;
  height: 9.5rem;
  padding-right: 0.5rem;
  padding-bottom: 0.5rem;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  -webkit-app-region: drag;
`
const DevModeContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 9.5rem;
  padding-bottom: 10px;
  box-sizing: border-box;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`
const ButtonNavLink = ({ history, to, ...props }) => (
  <NavLink
    to={to}
    onClick={() => history.push(to)}
    component={StyledButton}
    {...props}
  />
)
const getNetworkStatus = async p2p => {
  if (!p2p.networker || !p2p.networker.swarm || !(await isOnline())) {
    return 'red'
  }
  if (!p2p.networker.swarm.holepunchable()) return 'yellow'
  return 'green'
}

const Menu = ({ p2p, onFind }) => {
  const history = useHistory()
  const [networkStatus, setNetworkStatus] = useState('red')

  useEffect(() => {
    let unmounted = false
    ;(async () => {
      const check = async () => {
        if (unmounted) return
        const status = await getNetworkStatus(p2p)
        if (unmounted) return
        if (status !== networkStatus) setNetworkStatus(status)
        setTimeout(check, 1000)
      }
      check()
    })()
    return () => {
      unmounted = true
    }
  }, [networkStatus])

  return (
    <Container>
      <DevModeContainer>
        {!remote.app.isPackaged ? <StyledDevMode /> : ''}
      </DevModeContainer>
      <StyledLogo onClick={() => history.push('/')} />
      <NetworkStatusContainer
        title={
          {
            green: 'Connected',
            yellow: 'Connection limited - hole punching unavailable',
            red: 'Disconnected'
          }[networkStatus]
        }
      >
        {networkStatus === 'green' ? (
          <NetworkStatusGreen />
        ) : networkStatus === 'yellow' ? (
          <NetworkStatusYellow />
        ) : (
          <NetworkStatusRed />
        )}
      </NetworkStatusContainer>
      <StyledRow>
        <ButtonNavLink to='/' exact history={history} id='menu-feed'>
          Feed
        </ButtonNavLink>
        <ButtonNavLink to='/drafts' history={history} id='menu-drafts'>
          Drafts
        </ButtonNavLink>
        <ButtonNavLink to='/profile' history={history} id='menu-profile'>
          Profile
        </ButtonNavLink>
        <ButtonNavLink to='/following' history={history} id='menu-following'>
          Following
        </ButtonNavLink>
        <ButtonNavLink to='/discover' history={history} id='menu-discover'>
          Discover
        </ButtonNavLink>
      </StyledRow>
      <FindButton onClick={onFind} id='menu-find'>
        <StyledSearch />
        Find
      </FindButton>
      <AddContentLink to='/create' id='menu-create'>
        <AddContent />
      </AddContentLink>
    </Container>
  )
}

export default Menu
