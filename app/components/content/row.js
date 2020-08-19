import React, { useState, useEffect } from 'react'
import styled, { css } from 'styled-components'
import { purple, black, white, gray } from '../../lib/colors'
import isContentRegistered from '../../lib/is-content-registered'
import subtypes from '@hypergraph-xyz/wikidata-identifiers'
import { useHistory, useLocation, Link } from 'react-router-dom'
import Plus from './plus.svg'
import { encode } from 'dat-encoding'
import Anchor from '../anchor'
import newlinesToBr from '../../lib/newlines-to-br'
import OneParent from './1-parent.svg'
import Tabbable from '../accessibility/tabbable'

const AddContentWithParent = styled(Plus)`
  position: absolute;
  right: 0;
  top: 0;
  display: none;
  border-left: 2px solid ${purple};
  padding: 123px 41px;

  :hover {
    background-color: ${purple};
    path {
      fill: ${white};
    }
  }

  :active {
    background-color: inherit;
    path {
      fill: ${white};
    }
  }
`
const Container = styled.div`
  border-bottom: 2px solid ${purple};
  padding: 2rem ${props => props.pad || 2}rem;
  position: relative;
  height: ${props => (props.isParent ? 136 : 296)}px;
  box-sizing: border-box;

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
const Attributes = styled.div`
  display: inline-block;
  font-family: 'Roboto Mono';
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
const AuthorWithoutContentRegistration = styled.span`
  color: ${gray};
  margin: 1rem 0;
  display: inline-block;
  padding-bottom: 2px;
`
const Description = styled.div`
  overflow: hidden;
  max-height: 9em;
  margin-top: 1rem;
  :before {
    content: '';
    width: 100%;
    height: 74px;
    position: absolute;
    left: 0;
    bottom: 0;
    background: linear-gradient(transparent, ${black});
  }
`
const ToggleParent = styled.p`
  position: absolute;
  bottom: 0;
  margin: 0;
  padding-bottom: 2px;
  -webkit-app-region: no-drag;

  :hover {
    padding-bottom: 0;
    border-bottom: 2px solid ${purple};
  }
`
const ToggleParentArrow = styled.span`
  width: 16px;
  display: inline-block;
`

const Row = ({ p2p, content, pad, to, isParent }) => {
  const history = useHistory()
  const location = useLocation()
  const [authors, setAuthors] = useState([])
  const [showParent, setShowParent] = useState(false)
  const [parent, setParent] = useState()

  useEffect(() => {
    ;(async () => {
      const authors = await Promise.all(
        content.rawJSON.authors.map(key =>
          p2p.clone(encode(key), null, /* download */ false)
        )
      )
      setAuthors(authors)
    })()
  }, [content])

  if (content.rawJSON.parents[0]) {
    useEffect(() => {
      ;(async () => {
        setParent(await p2p.get(content.rawJSON.parents[0]))
      })()
    }, [content])
  }

  return (
    <>
      <Tabbable
        component={Container}
        pad={pad}
        onClick={e => {
          if (!e || e.target.tagName !== 'A') history.push(to)
        }}
        isParent={isParent}
      >
        <Attributes>
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
          {authors.map(author => {
            const to = `/profiles/${encode(author.rawJSON.url)}`
            const shouldScroll = to === location.pathname
            return isContentRegistered(content, author) ? (
              <Link
                component={Anchor}
                key={author.rawJSON.url}
                to={to}
                onClick={() => shouldScroll && window.scrollTo(0, 0)}
              >
                {author.rawJSON.title}
              </Link>
            ) : (
              <AuthorWithoutContentRegistration key={author.rawJSON.url}>
                {author.rawJSON.title}
              </AuthorWithoutContentRegistration>
            )
          })}
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
        {authors.find(author => isContentRegistered(content, author)) && (
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
          )}`}
          pad={isParent ? pad : 4}
          isParent
        />
      )}
    </>
  )
}

export default Row
