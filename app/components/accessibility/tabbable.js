import React from 'react'

const Tabbable = ({ onClick, component, ...props }) =>
  React.createElement(component, {
    ...props,
    tabIndex: '0',
    onClick: onClick,
    onKeyUp: e => {
      if (e.key === 'Enter') onClick()
    }
  })

export default Tabbable
