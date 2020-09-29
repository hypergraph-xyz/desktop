import React, { useState, useEffect, Fragment } from 'react'
import styled, { css } from 'styled-components'
import { purple, black, white, gray } from '../../lib/colors'
import subtypes from '@hypergraph-xyz/wikidata-identifiers'
import { useHistory, useLocation } from 'react-router-dom'
import Plus from './plus.svg'
import { encode } from 'dat-encoding'
import newlinesToBr from '../../lib/newlines-to-br'
import OneParent from './1-parent.svg'
import Tabbable from '../accessibility/tabbable'
import Author from '../author/author'
import ContentBlockSpinner from './content-block-spinner.svg'

const AddContentWithParent = styled(Plus)`
  position: absolute;
  right: 0;
  top: 0;
  display: none;
  border-left: 2px solid ${purple};
  padding: 123px 41px;
  z-index: 1;
  background-color: ${black};

  :hover {
    background-color: ${purple};
  }

  :active {
    background-color: inherit;
    path {
      fill: ${white};
    }
  }
`
const Container = styled.div`
  padding: ${props => props.pad || 0}rem;
  border-bottom: 2px solid ${purple};
  position: relative;
  height: ${props =>
    props.isParent ? 8.5 : props.isUnavailable ? 8 : 18.5}rem;
  box-sizing: border-box;
  ${props => props.isUnavailable && `color: ${gray};`}
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
      background: linear-gradient(transparent, ${purple});
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
  color: ${gray};
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
      background: linear-gradient(transparent, ${black});
    }
  }
`
const ToggleParent = styled.p`
  position: absolute;
  bottom: 0;
  margin: 0;
  padding-bottom: 2px;
  -webkit-app-region: no-drag;
  z-index: 1;

  :hover {
    padding-bottom: 0;
    border-bottom: 2px solid ${purple};
  }
`
const ToggleParentArrow = styled.span`
  width: 16px;
  display: inline-block;
`

const Row = ({ p2p, content, pad, to, isParent, isRegistered }) => {
  const history = useHistory()
  const location = useLocation()
  const [showParent, setShowParent] = useState(false)
  const [parent, setParent] = useState()

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
        onClick={e => {
          if (!e || e.target.tagName !== 'A') history.push(to)
        }}
        isParent={isParent}
      >
        <Hover isParent={isParent}>
          <Attributes pad={pad}>
            <Attribute>
              {subtypes[content.rawJSON.subtype] || 'Unknown'}
            </Attribute>
            {parent && (
              <Attribute title={`Follows from "${parent.rawJSON.title}"`}>
                <OneParent />
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
            {!isParent && content.rawJSON.parents[0] && (
              <ToggleParent
                onClick={e => {
                  e.stopPropagation()
                  setShowParent(!showParent)
                }}
              >
                <ToggleParentArrow>{showParent ? '▾' : '▸'}</ToggleParentArrow>
                Follows from
              </ToggleParent>
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
      {(showParent || isParent) && parent && (
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
