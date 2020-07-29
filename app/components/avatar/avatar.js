import React from 'react'
import styled from 'styled-components'
import Background from './background.svg'

const Container = styled.div`
  position: relative;
  width: ${props => props.size};
  height: ${props => props.size};
  text-align: center;
`
Container.defaultProps = {
  size: '8rem'
}
const StyledInitials = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: black;
  font-size: 2.5rem;
  font-family: 'Roboto Mono';
`
const StyledBackground = styled(Background)`
  width: 100%;
  height: 100%;
`

const getInitials = name => {
  if (!name || !name.length) return '?'
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .filter(Boolean)
  return [initials.shift(), initials.pop()].filter(Boolean).join('')
}

const Avatar = ({ name, ...props }) => (
  <Container {...props}>
    <StyledBackground viewBox='0 0 112 128' />
    <StyledInitials>{getInitials(name)}</StyledInitials>
  </Container>
)

export default Avatar
