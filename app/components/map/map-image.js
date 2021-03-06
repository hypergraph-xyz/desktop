import React, { useEffect } from 'react'
import * as d3 from 'd3'
import Loading, { LoadingFlex } from '../loading/loading'
import mapData from './map-data.json'

const MapImage = ({ graph }) => {
  useEffect(() => {
    ;(async () => {
      if (graph) {
        console.log(graph)
        var margin = { top: 10, right: 30, bottom: 30, left: 40 },
          width = 400 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom
        var svg = d3
          .select('#moduleMap')
          .append('svg')
          .attr('width', 500)
          .attr('height', 500)
          .append('g')

        // Initialize the links
        var link = svg
          .selectAll('line')
          .data(mapData.links)
          .enter()
          .append('line')
          .style('stroke', '#fff')

        // Initialize the nodes
        var node = svg
          .selectAll('circle')
          .data(mapData.nodes)
          .enter()
          .append('circle')
          .attr('r', 20)
          .style('fill', '#fff')
        // Let's list the force we wanna apply on the network
        var simulation = d3
          .forceSimulation(mapData.nodes) // Force algorithm is applied to mapData.nodes
          .force(
            'link',
            d3
              .forceLink() // This force provides links between nodes
              .id(function (d) {
                return d.id
              }) // This provide  the id of a node
              .links(mapData.links) // and this the list of links
          )
          .force('charge', d3.forceManyBody().strength(-400)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
          .force('center', d3.forceCenter(width / 2, height / 2)) // This force attracts nodes to the center of the svg area
          .on('end', ticked)

        // This function is run at each iteration of the force algorithm, updating the nodes position.
        function ticked () {
          link
            .attr('x1', function (d) {
              return d.source.x
            })
            .attr('y1', function (d) {
              return d.source.y
            })
            .attr('x2', function (d) {
              return d.target.x
            })
            .attr('y2', function (d) {
              return d.target.y
            })
          node
            .attr('cx', function (d) {
              return d.x + 6
            })
            .attr('cy', function (d) {
              return d.y - 6
            })
        }
        //   }
        // )
      }
      // graph
      // ? (
      //     console.log(svg)
      // ) : console.log("Waiting for graph input")
    })()
  })

  return (
    <>
      <div id='moduleMap'>
        {graph ? (
            <></>
        ) : (
          <LoadingFlex>
            <Loading />
          </LoadingFlex>
        )}
      </div>
    </>
  )
}

export default MapImage
