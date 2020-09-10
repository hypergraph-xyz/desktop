import React from 'react'
import styled, { css } from 'styled-components'
import { black, purple, white, gray } from '../../lib/colors'
import Loading from '../loading/loading'
import { Heading3 } from '../typography'

export const Row = styled.div`
  border-top: ${props => (props.noBorderTop ? 0 : 2)}px solid ${purple};
  border-bottom: 2px solid ${purple};
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
  border-right: 2px solid ${purple};
  padding: 0 ${props => (props.content === 'icon' ? '1rem' : '2rem')};
  display: inline-block;
  overflow: hidden;
  height: 100%;
  text-align: center;
  text-align: left;

  ${Row} & {
    border-right-width: 0;
  }
`
const StyledButton = styled(Cell).attrs({
  as: 'button'
})`
  background-color: ${props =>
    props.emphasis === 'top' && props.disabled
      ? gray
      : props.emphasis === 'top'
      ? props.color || purple
      : black};
  vertical-align: top;
  font-family: Roboto;
  letter-spacing: 0.05em;

  font-size: 1rem;
  height: 4rem;
  border: 2px solid ${purple};
  border-color: ${props =>
    props.content !== 'icon' && props.disabled ? gray : props.color || purple};
  color: ${props =>
    props.isLoading && props.emphasis === 'top'
      ? gray
      : props.isLoading
      ? black
      : white};
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
            color: ${props => (props.isLoading ? gray : white)};
            background-color: ${props =>
              props.emphasis === 'top' ? black : props.color || purple};
            ${props =>
              props.content !== 'icon' &&
              css`
                path {
                  fill: ${white};
                }
              `}
          }

          :active {
            background-color: ${props =>
              props.emphasis === 'top' ? props.color || purple : black};
            outline: none;
          }
        `}

  ${Row} & {
    border-right-width: 0px;
    border-top-width: 0px;
    border-bottom-width: 0px;
    border-color: ${purple};
    color: ${props => (props.disabled ? gray : props.color || white)};
    margin-right: 0;
    ${props =>
      props.disabled
        ? css`
            background-color: inherit;
          `
        : css`
            :hover {
              color: ${white};
            }
            :active {
              color: ${props => props.color || white};
            }
          `}
  }

  svg {
    vertical-align: middle;
    path {
      ${props =>
        props.disabled &&
        css`
          fill: ${gray};
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
  background-color: ${black};
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
    background-color: ${black};
  }
`
export const Title = styled(Cell)`
  font-size: 2.5rem;
  flex-grow: 1;
`
