const sort = (a, b) =>
  a.metadata.lastModified && b.metadata.lastModified
    ? b.metadata.lastModified - a.metadata.lastModified
    : 0

export default sort
