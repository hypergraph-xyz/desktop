import React from 'react'
import Modal, { Close } from '../modal/modal'
import { Heading2, Paragraph } from '../typography'
import { Label, Input } from '../forms/forms'
import { encode } from '../../lib/hypergraph-url'

export default ({ url, onClose }) => (
  <Modal height={329} border onClose={onClose}>
    <>
      <Close onClick={onClose} />
      <Heading2>Share this profile 🎉</Heading2>
      <Paragraph>
        Want other Hypergraph users to see this work? Copy the link below and
        send it any way you want to. Disclaimer: Once information is shared, you
        cannot delete it from their computers.
      </Paragraph>
      <Label>Profile URL</Label>
      <Input value={encode(url)} readOnly onClick={ev => ev.target.select()} />
    </>
  </Modal>
)
