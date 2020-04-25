const path = require('path')
const fs = require('fs')
const yajsondiff = require('yajsondiff')

console.log('Running json-intellimerge, intelligent JSON merging not written by a troglodyte')

let args = process.argv.slice(2)

if (args.length !== 3) {
  console.log('Passed in arguments must be: %O %A %B')
  process.exit(1)
  return
}

let ancestorFile  = path.resolve(args[0])
let currentFile   = path.resolve(args[1])
let otherFile     = path.resolve(args[2])

let ancestor = JSON.parse(fs.readFileSync(ancestorFile))
let current = JSON.parse(fs.readFileSync(currentFile))
let other = JSON.parse(fs.readFileSync(otherFile))

let currentDiff = yajsondiff.diff(ancestor, current)
let otherDiff = yajsondiff.diff(ancestor, other)

let sharedDiffs = []
let collisionDiffIndices = {}

currentDiff.forEach((diff, diffIndex) => {
  let collisionIndex = otherDiff.findIndex((odiff, odiffIndex) => {
    if (JSON.stringify(odiff.path) === JSON.stringify(diff.path)) return true
    return false
  })
  if (collisionIndex >= 0) {
    if (collisionDiffIndices[diffIndex] === undefined) {
      collisionDiffIndices[diffIndex] = collisionIndex
    }
  } else {
    sharedDiffs.push(diff)
  }
})

otherDiff.forEach((diff, diffIndex) => {
  let collisionIndex = currentDiff.findIndex((odiff, odiffIndex) => {
    if (JSON.stringify(odiff.path) === JSON.stringify(diff.path)) return true
    return false
  })
  if (collisionIndex >= 0) {
    if (collisionDiffIndices[collisionIndex] === undefined) {
      collisionDiffIndices[collisionIndex] = diffIndex
    }
  } else {
    sharedDiffs.push(diff)
  }
})

let collisionKVs = Object.entries(collisionDiffIndices)
if (collisionKVs.length) {
  // TODO: We could, perhaps, do a text-based merge ourself here...? For now we presume that the driver falls back to the standard text-based one. This is really only a sane decision if the JSON file is split by newlines.
  // lhs is ours, rhs is theirs
  /*let currentCollisionIndices = collisionKVs.map(kv=>kv[0])
  let otherCollisionsIndices = collisionKVs.map(kv=>kv[1])

  let currentCollisionsDiffs = currentDiff.filter((c, cI) => {
    return currentCollisionIndices.indexOf(cI) !== -1
  })

  let otherCollisionsDiffs = otherDiff.filter((c, cI) => {
    return otherCollisionsIndices.indexOf(cI) !== -1
  })*/
  console.log(collisionKVs.length + ' collision(s) found - bailing because too complex to resolve')
  process.exit(2)
  return
}

console.log('No conflicts found, merging...')

let merged = yajsondiff.applyChanges(ancestor, sharedDiffs)
let mergedOutput = JSON.stringify(merged, null, '\t')

fs.writeFileSync(currentFile, mergedOutput)

process.exit(0)
