import React from 'react'
import styled from 'styled-components'
import Background from './background.svg'

const Container = styled.div`
  position: relative;
  width: 8rem;
  height: 8rem;
  text-align: center;
`
const StyledInitials = styled.div`
  position: absolute;
  top: 2.1rem;
  color: black;
  font-size: 2.5rem;
  font-family: 'Roboto Mono';
  width: 100%;
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
    <Background viewBox='0 0 112 128' />
    <StyledInitials>{getInitials(name)}</StyledInitials>
  </Container>
)

export default Avatar
