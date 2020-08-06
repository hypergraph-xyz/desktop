import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { black, white } from '../../lib/colors'
import Menu from '../menu/menu'
import 'focus-visible'

import RobotoRegular from './fonts/Roboto/Roboto-Regular.ttf'
import RobotoLight from './fonts/Roboto/Roboto-Light.ttf'
import RobotoMono from './fonts/Roboto Mono/RobotoMono-Regular.ttf'

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Roboto';
    src: url(${RobotoRegular}) format('truetype');
    font-weight: 400;
  }
  @font-face {
    font-family: 'Roboto';
    src: url(${RobotoLight}) format('truetype');
    font-weight: 300;
  }
  @font-face {
    font-family: 'Roboto Mono';
    src: url(${RobotoMono}) format('truetype');
    font-weight: 400;
  }
  html {
    -webkit-user-select: none;
    -webkit-app-region: drag;
  }
  body {
    background-color: ${black};
    color: ${white};
    margin: 0;
    font-family: Roboto;
    line-height: 1.5;
    letter-spacing: 0.05em;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }
  button, svg, input, textarea {
    -webkit-app-region: no-drag;
  }
  #chatra.chatra--pos-right {
    right: 1rem !important;
  }
  #chatra.chatra--side-bottom {
    bottom: 1rem !important;
  }
  *:focus:not(.focus-visible) {
    outline: none;
  }
`
const Content = styled.div`
  margin-left: 8rem;
  margin-top: 3rem;
`

const Layout = ({ children, onFind }) => {
  return (
    <>
      <GlobalStyle />
      <Menu onFind={onFind} />
      <Content>{children}</Content>
    </>
  )
}

export default Layout
