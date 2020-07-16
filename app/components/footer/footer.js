import { shell } from 'electron'
import React, { useState } from 'react'
import styled from 'styled-components'
import Arrow from '../icons/arrow.svg'
import { useScrollPosition } from '@n8tb1t/use-scroll-position'
import Anchor from '../anchor'

const Container = styled.div`
  text-align: center;
  padding-top: 6rem;
  padding-bottom: 2rem;
  padding-left: 2rem;
  padding-right: 2rem;
  font-weight: 300;
  position: relative;
`
const Title = styled.div`
  font-size: 2em;
  margin-bottom: 77px; /* TODO */
`
const UpArrow = styled(Arrow)`
  position: absolute;
  right: 2rem;
  bottom: 2rem;
  -webkit-app-region: no-drag;
`
const scrollToTop = () => {
  document.documentElement.scrollTop = 0
}

const Footer = ({ title }) => {
  const [upArrowVisible, setUpArrowVisible] = useState(false)

  useScrollPosition(
    ({ currPos: { y } }) => {
      const isVisible = y < 48
      if (isVisible !== upArrowVisible) setUpArrowVisible(isVisible)
    },
    [upArrowVisible]
  )

  return (
    <Container>
      <Title>{title}</Title>
      Cooperatively made with 💜 in Berlin by{' '}
      <Anchor onClick={() => shell.openExternal('https://libscie.org')}>
        Liberate Science GmbH
      </Anchor>
      {upArrowVisible && <UpArrow onClick={scrollToTop} />}
    </Container>
  )
}

export default Footer
