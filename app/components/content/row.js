import React, { useState, useEffect, Fragment } from 'react'
import styled, { css } from 'styled-components'
import { colors } from '@libscie/design-library'
import subtypes from '@hypergraph-xyz/wikidata-identifiers'
import { useHistory, useLocation } from 'react-router-dom'
import ChildContentButton from './child-content-button.svg'
import { encode } from 'dat-encoding'
import newlinesToBr from '../../lib/newlines-to-br'
import OneParent from './1-parent.svg'
import TwoParent from './2-parent.svg'
import ThreeParent from './3-parent.svg'
import MoreParent from './more-parent.svg'
import Tabbable from '../accessibility/tabbable'
import Author from '../author/author'
import ContentBlockSpinner from './content-block-spinner.svg'

const AddContentWithParent = styled(ChildContentButton)`
  position: absolute;
  width: 56px;
  height: 56px;
  right: 0;
  top: 0;
  display: none;
  border-left: 2px solid ${colors.purple500};
  border-bottom: 2px solid ${colors.purple500};
  padding: 119px 41px;
  z-index: 1;
  background-color: ${colors.mono900};

  :hover {
    background-color: ${colors.purple500};
  }

  :active {
    background-color: inherit;
    path {
      fill: ${colors.white};
    }
  }
`
const Container = styled.div`
  padding: ${props => props.pad || 0}rem;
  border-bottom: 2px solid ${colors.purple500};
  position: relative;
  height: ${props =>
    props.isParent ? 8.5 : props.isUnavailable ? 8 : 18.5}rem;
  box-sizing: border-box;
  ${props => props.isUnavailable && `color: ${colors.mono500};`}
  flex-shrink: 0;

  ${props =>
    !props.isParent &&
    css`
      :hover {
        ${AddContentWithParent} {
          display: block;
        }
      }
    `}
`
const Hover = styled.div`
  height: 100%;
  :hover {
    :before {
      content: '';
      width: 100%;
      height: ${props => (props.isParent ? 5 : 10)}rem;
      position: absolute;
      left: 0;
      bottom: 0;
      background: linear-gradient(transparent, ${colors.purple500});
      z-index: 1;
    }
  }
`
const Attributes = styled.div`
  display: inline-block;
  font-family: 'Roboto Mono';
  max-width: 8rem;
  padding-left: ${props => props.pad || 2}rem;
  padding-top: 2rem;
`
const Attribute = styled.div`
  margin-bottom: 0.5rem;
`
const Content = styled.div`
  position: absolute;
  left: calc(8rem + ${props => props.pad || 2}rem);
  top: 2rem;
  right: 12rem;
  bottom: 2rem;
  overflow: hidden;
`
const Title = styled.div`
  font-size: 1.5rem;
  line-height: 1.75rem;
  margin-bottom: 1rem;
`
const Authors = styled.div`
  color: ${colors.mono500};
`
const Description = styled.div`
  overflow: hidden;
  max-height: 9em;
  margin-top: 1rem;
  ${Container}:not(:hover) & {
    :before {
      content: '';
      width: 100%;
      height: 74px;
      position: absolute;
      left: 0;
      bottom: 0;
      background: linear-gradient(transparent, ${colors.mono900});
    }
  }
`

const Row = ({ p2p, content, pad, to, isParent, isRegistered }) => {
  const history = useHistory()
  const location = useLocation()
  const [parentCount, setParentCount] = useState(0)
  const [parent, setParent] = useState()

  useEffect(() => {
    if (content) {
      setParentCount(content.rawJSON.parents.length)
    }
  })

  if (content && content.rawJSON.parents[0]) {
    useEffect(() => {
      ;(async () => {
        const [key, version] = content.rawJSON.parents[0].split('+')
        setParent(await p2p.clone(encode(key), version))
      })()
    }, [content])
  }

  return content ? (
    <>
      <Tabbable
        component={Container}
        onDoubleClick={e => {
          if (!e || e.target.tagName !== 'A') history.push(to)
        }}
        isParent={isParent}
      >
        <Hover isParent={isParent}>
          <Attributes pad={pad}>
            <Attribute>
              {subtypes[content.rawJSON.subtype] || 'Unknown'}
            </Attribute>
            {parent && parentCount === 1 && (
              <Attribute title={`Follows from "${parent.rawJSON.title}"`}>
                <OneParent />
              </Attribute>
            )}
            {parent && parentCount === 2 && (
              <Attribute title={`Follows from "${parent.rawJSON.title}"`}>
                <TwoParent />
              </Attribute>
            )}
            {parent && parentCount === 3 && (
              <Attribute title={`Follows from "${parent.rawJSON.title}"`}>
                <ThreeParent />
              </Attribute>
            )}
            {parent && parentCount > 3 && (
              <Attribute title={`Follows from "${parent.rawJSON.title}"`}>
                <MoreParent />
              </Attribute>
            )}
          </Attributes>
          <Content pad={pad}>
            <Title>{content.rawJSON.title}</Title>
            <Authors>
              {content.rawJSON.authors.map((authorUrl, i) => {
                const to = `/profiles/${encode(authorUrl)}`
                const shouldScroll = to === location.pathname
                return (
                  <Fragment key={authorUrl}>
                    {i > 0 && ', '}
                    <Author
                      p2p={p2p}
                      url={authorUrl}
                      content={content}
                      onClick={() => shouldScroll && window.scrollTo(0, 0)}
                      Loading={ContentBlockSpinner}
                    />
                  </Fragment>
                )
              })}
            </Authors>
            {!isParent && (
              <Description>
                {newlinesToBr(content.rawJSON.description)}
              </Description>
            )}
          </Content>
        </Hover>
        {isRegistered && (
          <AddContentWithParent
            onClick={e => {
              e.stopPropagation()
              history.push(
                `/create/${encode(content.rawJSON.url)}+${
                  content.metadata.version
                }`
              )
            }}
          />
        )}
      </Tabbable>
      {isParent && parent && (
        <Row
          p2p={p2p}
          content={parent}
          to={`/profiles/${encode(parent.rawJSON.authors[0])}/${encode(
            parent.rawJSON.url
          )}/${parent.metadata.version}`}
          pad={isParent ? pad : 4}
          isParent
        />
      )}
    </>
  ) : (
    <>
      <Container isUnavailable>
        <Attributes pad={pad}>
          <Attribute>Unknown</Attribute>
        </Attributes>
        <Content pad={pad}>
          <Title>Content temporarily unavailable</Title>
          <Authors>Author(s) unavailable</Authors>
        </Content>
      </Container>
    </>
  )
}

export default Row
