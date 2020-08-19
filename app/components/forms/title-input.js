import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { black, red, yellow, white } from '../../lib/colors'
import { Input } from './forms'

const Container = styled.div`
  position: relative;
`
const CharacterCounter = styled.div`
  text-align: right;
  color: ${props => props.color};
  margin-bottom: 10px;
`
const TitleInput = styled(Input).attrs({
  required: true,
  pattern: '.{1,300}',
  type: 'text',
  name: 'title'
})`
  margin-bottom: 8px;
`
const validate = title => title.length > 0 && title.length <= 300
export default ({ onIsValid = () => {}, defaultValue, ...props }) => {
  const [charCount, setCharCount] = useState(0)

  let color
  if (charCount === 0) {
    color = black
  } else if (charCount > 300) {
    color = red
  } else if (charCount >= 250) {
    color = yellow
  } else {
    color = white
  }

  if (defaultValue) {
    useEffect(() => {
      onIsValid(validate(defaultValue))
    }, [])
  }

  return (
    <Container>
      <TitleInput
        {...props}
        defaultValue={defaultValue}
        onChange={e => {
          const {
            target: { value: title }
          } = e
          setCharCount(title.length)
          onIsValid(validate(title))
          if (props.onChange) props.onChange(e)
        }}
      />
      <CharacterCounter color={color}>{charCount}/300</CharacterCounter>
    </Container>
  )
}
