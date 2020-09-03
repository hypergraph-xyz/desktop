import React, { Fragment } from 'react'

export default text =>
  text.split(/\r?\n/).map((line, i) => (
    <Fragment key={`${String(i)}${line}`}>
      {line}
      <br />
    </Fragment>
  ))
