import React from 'react'
import styled from 'styled-components'
import { purple, black, white } from '../../lib/colors'
import CaretDown from '../icons/caret-down-1rem.svg'
import { Title } from '../layout/grid'

export const Label = styled.label`
  font-weight: bold;
  display: block;
`
export const Input = styled.input`
  border: 2px solid ${purple};
  background-color: ${black};
  font-size: 2rem;
  padding: 11px 17px;
  margin-bottom: 1rem;
  color: ${white};
  display: block;
  width: 100%;
  box-sizing: border-box;
  font-family: Roboto;
  letter-spacing: 0.05rem;

  ${Title} > & {
    border: 0;
    display: inline-block;
    font-size: 40px;
    padding: 0;
    outline: 0;
  }
`
const SelectContainer = styled.div`
  position: relative;
`
const SelectElement = styled.select`
  display: block;
  background-color: ${black};
  color: ${white};
  border: 2px solid ${purple};
  font-size: 1rem;
  width: 100%;
  max-width: 661px;
  height: 2rem;
  border-radius: 0;
  appearance: none;
  margin-bottom: 1rem;
  font-family: Roboto;
  padding-left: 19px;
  letter-spacing: 0.05em;
`
const SelectCaret = styled(CaretDown)`
  position: absolute;
  right: 16.37px;
  top: 5px;
`
export const Select = ({ ...props }) => (
  <SelectContainer>
    <SelectElement {...props} />
    <SelectCaret />
  </SelectContainer>
)

export const Textarea = styled.textarea`
  border: 2px solid ${purple};
  background-color: ${black};
  font-size: 1rem;
  padding: 7px 17px;
  margin-bottom: 2rem;
  color: ${white};
  display: block;
  width: 100%;
  box-sizing: border-box;
  height: 12rem;
  font-family: Roboto;
  letter-spacing: inherit;
  line-height: inherit;
`

export const Checkbox = styled.input.attrs({
  type: 'checkbox',
  defaultChecked: true
})`
  margin-right: 0.5rem;
`
