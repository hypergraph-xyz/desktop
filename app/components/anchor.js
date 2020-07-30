import React from 'react'
import styled, { css } from 'styled-components'
import { white, purple, gray } from '../lib/colors'

const StyledAnchor = styled.a`
  text-decoration: none;
  color: ${props => (props.disabled ? gray : white)};
  border-bottom: 2px solid
    ${props => (props.disabled ? gray : props.color || purple)};
  display: inline-block;
  -webkit-app-region: no-drag;

  ${props =>
    props.disabled
      ? css`
          cursor: not-allowed;
        `
      : css`
          :hover {
            background-color: ${props => props.color || purple};
            cursor: pointer;
          }
        `}
`

const Anchor = ({ onClick, disabled, ...props }) => (
  <StyledAnchor
    disabled={disabled}
    onClick={() => !disabled && onClick && onClick()}
    {...props}
  />
)
Anchor.defaultProps = {
  href: '#'
}

export default Anchor
