import fetch from 'node-fetch'
import { ipcRenderer } from 'electron'

export const archiveModule = async (url, { queue = true } = {}) => {
  console.time('archive')
  const opts = {
    method: 'POST',
    body: url
  }
  let res
  try {
    res = await fetch('http://localhost:8080/api/modules', opts)
  } catch (_) {
    try {
      res = await fetch('https://vault.hypergraph.xyz/api/modules', opts)
    } catch (err) {
      console.error(err)
      console.timeEnd('archive')
      if (queue) return addToQueue(url)
      else throw new Error(err)
    }
  }
  if (!res.ok) {
    const err = new Error(await res.text())
    console.error(err)
    console.timeEnd('archive')
    if (queue) return addToQueue(url)
    else throw new Error(err)
  }
  console.timeEnd('archive')
}

const sleep = dt => new Promise(resolve => setTimeout(resolve, dt))

const addToQueue = async url => {
  const queue = await ipcRenderer.invoke('getStoreValue', 'queue', [])
  await ipcRenderer.invoke('setStoreValue', 'queue', [...queue, url])
}

const removeFirstFromQueue = async () => {
  const queue = await ipcRenderer.invoke('getStoreValue', 'queue')
  queue.shift()
  await ipcRenderer.invoke('setStoreValue', 'queue', queue)
}

const getFirstFromQueue = async () => {
  const queue = await ipcRenderer.invoke('getStoreValue', 'queue', [])
  return queue[0]
}

;(async () => {
  while (true) {
    const url = await getFirstFromQueue()
    if (url) {
      try {
        await archiveModule(url, { queue: false })
        await removeFirstFromQueue()
      } catch (_) {}
    }
    await sleep(1000)
  }
})()
