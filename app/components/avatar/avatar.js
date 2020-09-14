import React from 'react'
import styled from 'styled-components'
import { purple, blue, green, yellow, red } from '../../lib/colors'

const colors = [purple, blue, green, yellow, red]

const Container = styled.div`
  position: relative;
  width: calc(${props => props.size} * 0.86);
  height: ${props => props.size};
  text-align: center;
  background: linear-gradient(
    120deg,
    ${props => props.colors[0]} 0%,
    ${props => props.colors[1]} 100%
  );
  clip-path: polygon(0% 21%, 50% 0%, 100% 21%, 100% 79%, 50% 100%, 0% 79%);
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

const getInitials = name => {
  if (!name || !name.length) return '?'
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .filter(Boolean)
  return [initials.shift(), initials.pop()].filter(Boolean).join('')
}

const Avatar = ({ name, ...props }) => {
  const initials = getInitials(name)
  const colorIndexes = [
    initials[0].charCodeAt(0) % colors.length,
    initials[initials.length - 1].charCodeAt(0) % colors.length
  ]
  if (colorIndexes[1] === colorIndexes[0]) {
    colorIndexes[1] = (colorIndexes[1] + 1) % colors.length
  }

  return (
    <Container
      colors={[colors[colorIndexes[0]], colors[colorIndexes[1]]]}
      {...props}
    >
      <StyledInitials>{initials}</StyledInitials>
    </Container>
  )
}

export default Avatar
