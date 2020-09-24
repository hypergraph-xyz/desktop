import React from 'react'
import Reactour from 'reactour'
import styled from 'styled-components'
import { purple } from '../../lib/colors'

const StyledTour = styled(Reactour)`
  color: black;
  font-size: 0.9em;
  transition: none;
  -webkit-transition: none;
  button:focus {
    outline: 0;
  }
`

const Tour = ({ onClose, ...props }) => {
  return (
    <StyledTour
      {...props}
      accentColor={purple}
      closeWithMask={false}
      maskSpace={2}
      onRequestClose={onClose}
      steps={[
        {
          content: (
            <div>
              <p>
                Welcome to Hypergraph (Beta) 🥳 We'll get you started with a
                quick tour of the most important things.
              </p>
            </div>
          )
        },
        {
          content: (
            <div>
              <p>First things first: Creating a backup.</p>
              <p>
                We don't use passwords, but keys 🔑. Just like your house keys,
                you need to store them safely and not lose them.
              </p>
            </div>
          )
        },
        {
          content: (
            <div>
              <p>
                Create a backup by opening <i>Database → Back up database</i> in
                the menu bar (at the top).
              </p>
              <p>
                We cannot help you recover these, so store them safely! Maybe
                your Dropbox, USB stick, or somewhere else 🤔
              </p>
            </div>
          )
        },
        {
          content: (
            <div>
              <p>Now we'll see where you can find what information.</p>
            </div>
          )
        },
        {
          selector: '#menu-feed',
          content: <div>The feed tab shows all content in your network.</div>
        },
        {
          selector: '#menu-drafts',
          content: <div>The drafts tab shows your unfinished work.</div>
        },
        {
          selector: '#menu-profile',
          content: (
            <div>
              The profile tab allows you to see and update your profile.
            </div>
          )
        },
        {
          selector: '#menu-following',
          content: (
            <div>
              The following tab gives you a quick overview of the people in your
              network.
            </div>
          )
        },
        {
          selector: '#menu-find',
          content: <div>You can open Hypergraph links here.</div>
        },
        {
          selector: '#menu-create',
          content: (
            <div>Add your research steps by clicking this big button.</div>
          )
        },
        {
          content: (
            <div>
              <p>
                If anything gets confusing, we're available in the chat on the
                bottom right (no bots!).
              </p>
              <p>
                Feel free to say hello, ask a question, or give us feedback! 🙋🏻‍♀️
                🙋🏽‍♂️ 🙋🏿‍♀️
              </p>
            </div>
          )
        }
      ]}
    />
  )
}

export default Tour
