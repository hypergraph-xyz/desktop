import React from 'react'
import styled from 'styled-components'
import { black, purple, white, gray } from '../../lib/colors'
import LoadingAnimation from './loading.svg'

const rowHeight = 64

export const Cell = styled.div`
  border-right: 2px solid ${purple};
  padding: 0 2rem;
  display: inline-block;
  overflow: hidden;
  height: 100%;
  text-align: center;
`
export const Row = styled.div`
  border-top: ${props => (props.noBorderTop ? 0 : 2)}px solid ${purple};
  border-bottom: 2px solid ${purple};
  height: ${rowHeight}px;
  white-space: nowrap;
  line-height: ${rowHeight}px;
`
const StyledButton = styled(Cell).attrs({
  as: 'button'
})`
  background-color: ${props =>
    props.disabled
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
  border-color: ${props => (props.disabled ? gray : props.color || purple)};
  color: ${props => (props.isLoading ? gray : white)};
  margin-right: 1rem;
  min-width: 8rem;
  position: relative;

  :hover {
    color: ${props => (props.isLoading ? gray : white)};
    background-color: ${props =>
      props.disabled
        ? gray
        : props.emphasis === 'top'
        ? black
        : props.color || purple};
    path {
      fill: ${white};
    }
  }

  :active {
    background-color: ${props =>
      props.disabled
        ? gray
        : props.emphasis === 'top'
        ? props.color || purple
        : black};
    outline: none;
  }

  :focus {
    outline: none;
  }

  ${Row} > & {
    border-left-width: 0px;
    border-top-width: 0px;
    border-bottom-width: 0px;
    border-color: ${purple};
    color: ${props => props.color || white};
    margin-right: 0;
    :hover {
      color: ${white};
    }
    :active {
      color: ${props => props.color || white};
    }
  }
`
const Loading = styled(LoadingAnimation)`
  position: absolute;
  top: 0;
  left: 50%;
  margin-left: -30px !important;
`
export const Button = ({ isLoading, children, ...props }) => (
  <StyledButton
    {...props}
    isLoading={isLoading}
    disabled={props.disabled || isLoading}
  >
    {children}
    {isLoading && <Loading height='100%' width='60px' />}
  </StyledButton>
)
export const StickyRow = styled(Row)`
  position: sticky;
  top: ${props => props.top}px;
  background-color: ${black};
  z-index: 1;
`
export const TopRow = styled(StickyRow)`
  top: 3rem;

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
  font-size: 40px;
`
export const Spacer = styled.div`
  display: inline-block;
  width: 2rem;
  height: 100%;
  border-right: 2px solid ${purple};
  vertical-align: top;
`
