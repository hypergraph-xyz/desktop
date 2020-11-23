import React from 'react'
import styled from 'styled-components'
import Anchor from '../anchor'
import AddContent from '../icons/add-content.svg'
import Search from '../icons/search-icon-1rem.svg'

const Container = styled.div`
  text-align: center;
  padding: 6rem 0;
  font-weight: 300;
  position: relative;
  height: 100%;
  -webkit-user-select: none;
`
const Title = styled.div`
  font-size: 2em;
  padding: 0 2rem;
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
const Credits = styled.div`
  position: absolute;
  bottom: 2rem;
  width: 100%;
`

const Footer = ({ title }) => (
  <Container>
    <Title>{title}</Title>
    <Credits>
      Cooperatively made with 💜 in Berlin by{' '}
      <Anchor href='https://libscie.org'>Liberate Science GmbH</Anchor>
    </Credits>
  </Container>
)

export default Footer
