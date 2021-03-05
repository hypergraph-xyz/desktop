import React from 'react'
import d3 from 'd3'

const MapImage = ({graph}) => {
    console.log(graph)
    return (
        <>
          {graph ? <div>Test</div> : <div>Fail</div>}
        </>
    )
}

export default MapImage