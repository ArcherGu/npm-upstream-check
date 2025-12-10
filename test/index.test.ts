import fs from 'node:fs'
import path from 'node:path'
import core from '@actions/core'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vitest } from 'vitest'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { run } from '../src/main'

const mockDir = path.resolve(__dirname, './mock')
const srcPkgJson = {
  name: 'test',
  dependencies: {
    'vue': '^3.0.0',
    'vue-router': '^4.0.0',
  },
}

const srcDeepPkgJson = {
  name: 'deep-test',
  dependencies: {
    react: '^18.0.0',
  },
}

const srcPnpmCatalogPkgJson = {
  name: 'pnpm-catalog-test',
  workspaces: [],
  dependencies: {
    'vue': 'catalog:',
    'vue-router': 'catalog:',
  },
}

const srcPnpmCatalogWorkspaceYaml = {
  catalog: {
    'vue': '^3.0.0',
    'vue-router': '^4.0.0',
  },
}

function readPackageJson() {
  return [
    JSON.parse(fs.readFileSync(path.resolve(mockDir, 'package.json'), 'utf-8')),
    JSON.parse(fs.readFileSync(path.resolve(mockDir, 'deep/package.json'), 'utf-8')),
  ]
}

function readPnpmCatalogWorkspaceYaml() {
  return parseYaml(fs.readFileSync(path.resolve(mockDir, 'pnpm-workspace.yaml'), 'utf-8'))
}

const getInputMock = vitest.spyOn(core, 'getInput')
const setOutputMock = vitest.spyOn(core, 'setOutput')
const setFailedMock = vitest.spyOn(core, 'setFailed')

function runMain() {
  return run(mockDir)
}

describe('action', () => {
  beforeAll(() => {
    fs.mkdirSync(mockDir)
    fs.mkdirSync(path.resolve(mockDir, 'deep'))
  })

  beforeEach(() => {
    vitest.clearAllMocks()
    fs.writeFileSync(path.resolve(mockDir, 'package.json'), JSON.stringify(srcPkgJson))
    fs.writeFileSync(path.resolve(mockDir, 'deep/package.json'), JSON.stringify(srcDeepPkgJson))
  })

  afterAll(() => {
    fs.rmSync(mockDir, { recursive: true })
  })

  it('updates the package.json', async () => {
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case 'upstream':
          return 'vue'
        default:
          return ''
      }
    })

    await runMain()

    const [pkgJson, deepPkgJson] = readPackageJson()

    expect(pkgJson.dependencies.vue).not.equal(srcPkgJson.dependencies.vue)
    expect(pkgJson.dependencies['vue-router']).equal(srcPkgJson.dependencies['vue-router'])
    expect(deepPkgJson.dependencies.react).equal(srcDeepPkgJson.dependencies.react)

    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'need-update',
      true,
    )

    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'dependencies',
      {
        vue: pkgJson.dependencies.vue,
      },
    )

    await runMain()

    const [pkgJson2, deepPkgJson2] = readPackageJson()
    expect(pkgJson2.dependencies.vue).equal(pkgJson.dependencies.vue)
    expect(pkgJson2.dependencies['vue-router']).equal(pkgJson.dependencies['vue-router'])
    expect(deepPkgJson2.dependencies.react).equal(deepPkgJson.dependencies.react)

    expect(setOutputMock).toHaveBeenNthCalledWith(
      3,
      'need-update',
      false,
    )
  })

  it('updates the package.json with ncu option', async () => {
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case 'upstream':
          return 'vue,react'
        case 'ncu-options':
          return '{"deep": true}'
        default:
          return ''
      }
    })

    await runMain()

    const [pkgJson, deepPkgJson] = readPackageJson()

    expect(pkgJson.dependencies.vue).not.equal(srcPkgJson.dependencies.vue)
    expect(pkgJson.dependencies['vue-router']).equal(srcPkgJson.dependencies['vue-router'])
    expect(deepPkgJson.dependencies.react).not.equal(srcDeepPkgJson.dependencies.react)

    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'need-update',
      true,
    )

    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'dependencies',
      {
        vue: pkgJson.dependencies.vue,
        react: deepPkgJson.dependencies.react,
      },
    )
  })

  it('updates the package.json with check-only', async () => {
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case 'upstream':
          return 'vue'
        case 'check-only':
          return 'true'
        default:
          return ''
      }
    })

    await runMain()

    const [pkgJson, deepPkgJson] = readPackageJson()

    expect(pkgJson.dependencies.vue).equal(srcPkgJson.dependencies.vue)
    expect(pkgJson.dependencies['vue-router']).equal(srcPkgJson.dependencies['vue-router'])
    expect(deepPkgJson.dependencies.react).equal(srcDeepPkgJson.dependencies.react)

    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'need-update',
      true,
    )
  })

  it('updates all dependencies in package.json', async () => {
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case 'upstream':
          return 'vue'
        case 'all':
          return 'true'
        default:
          return ''
      }
    })

    await runMain()

    const [pkgJson, deepPkgJson] = readPackageJson()

    expect(pkgJson.dependencies.vue).not.equal(srcPkgJson.dependencies.vue)
    expect(pkgJson.dependencies['vue-router']).not.equal(srcPkgJson.dependencies['vue-router'])
    expect(deepPkgJson.dependencies.react).equal(srcDeepPkgJson.dependencies.react)

    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'need-update',
      true,
    )

    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'dependencies',
      {
        'vue': pkgJson.dependencies.vue,
        'vue-router': pkgJson.dependencies['vue-router'],
      },
    )
  })

  it('fails if upstream is empty', async () => {
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case 'upstream':
          throw new Error('Input required and not supplied: upstream')
        default:
          return ''
      }
    })

    setFailedMock.mockImplementation(() => { })

    await runMain()

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'Input required and not supplied: upstream',
    )
  })

  it('updates the package.json with pnpm catalog', async () => {
    fs.writeFileSync(path.resolve(mockDir, 'pnpm-workspace.yaml'), stringifyYaml(srcPnpmCatalogWorkspaceYaml))
    fs.writeFileSync(path.resolve(mockDir, 'package.json'), JSON.stringify(srcPnpmCatalogPkgJson))

    getInputMock.mockImplementation((name) => {
      switch (name) {
        case 'upstream':
          return 'vue'
        case 'ncu-options':
          return '{"packageManager": "pnpm", "workspaces": true}'
        default:
          return ''
      }
    })

    await runMain()

    const workspaceYaml = readPnpmCatalogWorkspaceYaml()

    expect(workspaceYaml.catalog.vue).not.equal(srcPnpmCatalogWorkspaceYaml.catalog.vue)
    expect(workspaceYaml.catalog['vue-router']).equal(srcPnpmCatalogWorkspaceYaml.catalog['vue-router'])

    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'need-update',
      true,
    )

    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'dependencies',
      {
        vue: workspaceYaml.catalog.vue,
      },
    )
  })
})
