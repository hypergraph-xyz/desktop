import React, { useState, useEffect, useContext } from 'react'
import { TopRow, Title } from '../layout/grid'
import Loading, { LoadingFlex } from '../loading/loading'
import MapImage from './map-image'

export default ({ p2p }) => {
  const [mapData, setMapData] = useState()

  useEffect(() => {
    ;(async () => {
      const [profiles, contents] = await Promise.all([
        p2p.listProfiles(),
        p2p.listContent()
      ])
      const graph = {
        nodes: [
          ...profiles.map(module => ({
            id: module.rawJSON.url,
            type: module.rawJSON.type,
            subtype: module.rawJSON.subtype
          })),
          ...contents.map(module => ({
            id: `${module.rawJSON.url}+${module.metadata.version}`,
            type: module.rawJSON.type,
            subtype: module.rawJSON.subtype
          }))
        ],
        links: [
          ...profiles
            .map(profile => [
              ...profile.rawJSON.contents.map(url => ({
                source: profile.rawJSON.url,
                target: `hyper://${url}`
              })),
              ...profile.rawJSON.follows.map(url => ({
                source: profile.rawJSON.url,
                target: `hyper://${url}`
              }))
            ])
            .flat(),
          ...contents
            .map(content => [
              ...content.rawJSON.parents.map(url => ({
                source: `${content.rawJSON.url}+${content.metadata.version}`,
                target: `hyper://${url}`
              })),
              ...content.rawJSON.authors.map(url => ({
                source: `${content.rawJSON.url}+${content.metadata.version}`,
                target: `hyper://${url}`
              }))
            ])
            .flat()
        ]
      }

      setMapData(graph)
    })()
  }, [])

  return (
    <>
      <TopRow>
        <Title>Map</Title>
      </TopRow>
      {true ? (
        <MapImage graph={mapData} />
      ) : (
        <LoadingFlex>
          <Loading />
        </LoadingFlex>
      )}
    </>
  )
}
