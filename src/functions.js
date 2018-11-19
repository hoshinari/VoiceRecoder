import get from 'lodash/get'

const is = value => thing => value === thing
const some = (...values) => thing => value.includes(thing)
const digger = (path) => thing => get(thing, path)

export {
  is,
  some,
  digger,
}