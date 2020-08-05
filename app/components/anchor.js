import { shell } from 'electron'
import React from 'react'
import styled, { css } from 'styled-components'
import { white, purple, gray } from '../lib/colors'

const StyledAnchor = styled.a`
  text-decoration: none;
  color: ${props => (props.disabled ? gray : white)};
  border-bottom: 2px solid
    ${props => (props.disabled ? gray : props.color || purple)};
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

const Anchor = ({ onClick, disabled, href, ...props }) => (
  <StyledAnchor
    disabled={disabled}
    href={href}
    onClick={e => {
      if (disabled) return
      if (onClick) {
        onClick()
        return
      }
      if (href.match(/^(http|mailto:)/i)) {
        shell.openExternal(href)
        e.preventDefault()
      }
    }}
    {...props}
  />
)
Anchor.defaultProps = {
  href: '#'
}

export default Anchor
