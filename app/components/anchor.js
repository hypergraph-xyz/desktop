import { shell } from 'electron'
import React from 'react'
import styled, { css } from 'styled-components'
import { colors } from '@libscie/design-library'

const StyledAnchor = styled.a`
  text-decoration: none;
  color: ${props => (props.disabled ? colors.mono500 : colors.white)};
  border-bottom: 2px solid
    ${props =>
      props.disabled ? colors.mono500 : props.color || colors.purple500};
  -webkit-app-region: no-drag;

  ${props =>
    props.disabled
      ? css`
          cursor: not-allowed;
        `
      : css`
          :hover {
            background-color: ${props => props.color || colors.purple500};
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
