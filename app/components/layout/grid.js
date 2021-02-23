import React from 'react'
import styled, { css } from 'styled-components'
import { colors } from '@libscie/design-library'
import Loading from '../loading/loading'
import { Heading3 } from '../typography'

export const Row = styled.div`
  border-top: ${props => (props.noBorderTop ? 0 : 2)}px solid
    ${colors.purple500};
  border-bottom: 2px solid ${colors.purple500};
  height: 4rem;
  line-height: 4rem;
  white-space: nowrap;
  display: flex;
  align-items: center;

  ${Heading3} {
    margin: 0;
  }
`
export const Cell = styled.div`
  border-right: 2px solid ${colors.purple500};
  padding: 0 ${props => (props.content === 'icon' ? '1rem' : '2rem')};
  display: inline-block;
  overflow: hidden;
  height: 100%;
  text-align: center;
  text-align: left;
  -webkit-app-region: drag;
  user-select: none;

  ${Row} & {
    border-right-width: 0;
  }
`
const StyledButton = styled(Cell).attrs({
  as: 'button'
})`
  background-color: ${props =>
    props.emphasis === 'top' && props.disabled
      ? colors.mono500
      : props.emphasis === 'top'
      ? props.color || colors.purple500
      : colors.mono900};
  vertical-align: top;
  font-family: Roboto;
  letter-spacing: 0.05em;

  font-size: 1rem;
  height: 4rem;
  border: 2px solid ${colors.purple500};
  border-color: ${props =>
    props.content !== 'icon' && props.disabled
      ? colors.mono500
      : props.color || colors.purple500};
  color: ${props =>
    props.isLoading && props.emphasis === 'top'
      ? colors.mono500
      : props.isLoading
      ? colors.mono900
      : colors.white};
  margin-right: 2rem;
  min-width: ${props => (props.content === 'icon' ? 0 : '8rem')};
  position: relative;
  text-align: center;

  ${props =>
    props.disabled
      ? css`
          cursor: not-allowed;
        `
      : css`
          :hover {
            color: ${props =>
              props.isLoading ? colors.mono500 : colors.white};
            background-color: ${props =>
              props.emphasis === 'top'
                ? colors.mono900
                : props.color || colors.purple500};
            ${props =>
              props.content !== 'icon' &&
              css`
                path {
                  fill: ${colors.white};
                }
              `}
          }

          :active {
            background-color: ${props =>
              props.emphasis === 'top'
                ? props.color || colors.purple500
                : colors.mono900};
            outline: none;
          }
        `}

  ${Row} & {
    border-right-width: 0px;
    border-top-width: 0px;
    border-bottom-width: 0px;
    border-color: ${colors.purple500};
    color: ${props =>
      props.disabled ? colors.mono500 : props.color || colors.white};
    margin-right: 0;
    ${props =>
      props.disabled
        ? css`
            background-color: inherit;
          `
        : css`
            :hover {
              color: ${colors.white};
            }
            :active {
              color: ${props => props.color || colors.white};
            }
          `}
  }

  svg {
    vertical-align: middle;
    path {
      ${props =>
        props.disabled &&
        css`
          fill: ${colors.mono500};
        `}
    }
  }
`
export const Button = ({ isLoading, children, ...props }) => (
  <StyledButton
    {...props}
    isLoading={isLoading}
    disabled={props.disabled || isLoading}
  >
    {children}
    {isLoading && <Loading />}
  </StyledButton>
)
export const StickyRow = styled(Row)`
  position: sticky;
  top: ${props => props.top};
  background-color: ${colors.mono900};
  z-index: 2;
`
export const TopRow = styled(StickyRow).attrs({
  top: '3rem'
})`
  :before {
    content: '';
    position: absolute;
    top: -50px;
    width: 100%;
    height: 3rem;
    background-color: ${colors.mono900};
    -webkit-app-region: drag;
  }
`
export const Title = styled(Cell)`
  font-size: 2.5rem;
  flex-grow: 1;
`
