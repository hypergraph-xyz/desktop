import React, { useEffect, useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { black, white } from '../../lib/colors'
import Menu from '../menu/menu'
import 'focus-visible'
import { Helmet } from 'react-helmet'
import { ipcRenderer } from 'electron'
import { productName } from '../../../package'
import { useLocation } from 'react-router-dom'

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

const Layout = ({ children, p2p, onFind }) => {
  const [useAnalytics, setUseAnalytics] = useState()
  const [useChatra, setUseChatra] = useState()
  const location = useLocation()

  useEffect(() => {
    ;(async () => {
      setUseAnalytics(await ipcRenderer.invoke('getStoreValue', 'analytics'))
      ipcRenderer.on('analytics', (_, useAnalytics) => {
        setUseAnalytics(useAnalytics)
      })
    })()
  }, [])

  useEffect(() => {
    if (!window._paq) return
    window._paq.push(['setCustomUrl', location.pathname])
    window._paq.push(['trackPageView'])
  }, [location, window._paq])

  useEffect(() => {
    ;(async () => {
      setUseChatra(await ipcRenderer.invoke('getStoreValue', 'chatra'))
      ipcRenderer.on('chatra', (_, useChatra) => {
        setUseChatra(useChatra)
      })
    })()
  }, [])

  return (
    <>
      <GlobalStyle />
      <Helmet>
        <title>{productName}</title>
        {useAnalytics && (
          <script type='text/javascript'>
            {`
              var _paq = window._paq = window._paq || [];
              _paq.push(["setDocumentTitle", document.title]);
              _paq.push(['disableCookies']);
              _paq.push(['enableLinkTracking']);
              (function() {
                var u="https://analytics.libscie.org/";
                _paq.push(['setTrackerUrl', u+'matomo.php']);
                _paq.push(['setSiteId', '4']);
                var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                g.type='text/javascript'; g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
              })();
            `}
          </script>
        )}
        {useChatra && (
          <script>
            {`
              ;(function (d, w, c) {
                window.ChatraSetup = {
                  colors: {
                    buttonText: '#FFFFFF' /* chat button text color */,
                    buttonBg: '#574cfa' /* chat button background color */
                  }
                }
        
                w.ChatraID = 'vZo7KBf3WqmQPPasZ'
                var s = d.createElement('script')
                w[c] =
                  w[c] ||
                  function () {
                    ;(w[c].q = w[c].q || []).push(arguments)
                  }
                s.async = true
                s.src = 'https://call.chatra.io/chatra.js'
                if (d.head) d.head.appendChild(s)
              })(document, window, 'Chatra')
            `}
          </script>
        )}
      </Helmet>
      <Menu p2p={p2p} onFind={onFind} />
      <Content>{children}</Content>
    </>
  )
}

export default Layout
