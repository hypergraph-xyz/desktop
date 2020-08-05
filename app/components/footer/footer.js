import React from 'react'
import styled from 'styled-components'
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

const Footer = ({ title }) => (
  <Container>
    <Title>{title}</Title>
    Cooperatively made with 💜 in Berlin by{' '}
    <Anchor href='https://libscie.org'>Liberate Science GmbH</Anchor>
  </Container>
)

export default Footer
