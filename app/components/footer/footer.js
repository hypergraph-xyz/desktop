import React from 'react'
import styled from 'styled-components'
import Anchor from '../anchor'
import AddContent from '../icons/add-content.svg'
import Search from '../icons/search-icon-1rem.svg'

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
export const FooterAddContent = styled(AddContent)`
  vertical-align: middle;
  transform: scale(0.6);
  position: relative;
  top: -2px;
  margin-left: -6px;
  margin-right: -6px;
`
export const FooterSearch = styled(Search)`
  vertical-align: middle;
  transform: scale(1.5);
  position: relative;
  top: -2px;
  margin-left: 4px;
  margin-right: 6px;
`

const Footer = ({ title }) => (
  <Container>
    <Title>{title}</Title>
    Cooperatively made with 💜 in Berlin by{' '}
    <Anchor href='https://libscie.org'>Liberate Science GmbH</Anchor>
  </Container>
)

export default Footer
