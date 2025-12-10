import type { RunOptions } from 'npm-check-updates'
import { execSync } from 'node:child_process'
import path from 'node:path'
import * as core from '@actions/core'

function importModuleLocalOrGlobal(moduleName: string) {
  try {
    return require(moduleName)
  }
  catch {
    const globalDir = execSync('npm root --global').toString().trim()
    const globalPath = path.join(globalDir, moduleName)
    return require(globalPath)
  }
}

function prepareNcu() {
  try {
    const ncu = importModuleLocalOrGlobal('npm-check-updates')
    return ncu
  }
  catch {
    core.debug('npm-check-updates not found, installing...')
    const stdout = execSync('npm install npm-check-updates -g')
    core.debug(stdout.toString())
    const ncu = importModuleLocalOrGlobal('npm-check-updates')
    return ncu
  }
}

function parseNcuOptions(ncuOptionsJson: string) {
  try {
    return JSON.parse(ncuOptionsJson)
  }
  catch {
    return {}
  }
}

export async function run(cwd?: string) {
  try {
    const upstreamDeps = core.getInput('upstream', { required: true }).trim().split(',')
    const checkOnly = core.getInput('check-only', { required: false }) === 'true'
    const allDeps = core.getInput('all', { required: false }) === 'true'
    const ncuOptionsJson = core.getInput('ncu-options', { required: false })
    const ncuOptions = parseNcuOptions(ncuOptionsJson) as RunOptions

    core.debug(`upstream npm dependencies: ${upstreamDeps.join(', ')}`)

    const ncu = prepareNcu()

    const updateInfos: { [key: string]: string } = {}
    const result = await ncu.run({
      cwd,
      filterResults: (packageName) => {
        if (allDeps)
          return true

        return upstreamDeps.includes(packageName)
      },
      ...ncuOptions,
      upgrade: !checkOnly,
    } as RunOptions)

    if (!result) {
      core.setOutput('need-update', false)
      return
    }

    for (const key in result) {
      if (ncuOptions.deep) {
        for (const pkgName in (result as any)[key]) {
          if (allDeps || upstreamDeps.includes(pkgName))
            updateInfos[pkgName] = (result as any)[key][pkgName]
        }
      }
      else {
        if (allDeps || upstreamDeps.includes(key))
          updateInfos[key] = (result as any)[key]
      }
    }

    const needUpdate = Object.keys(updateInfos).length > 0
    core.setOutput('need-update', needUpdate)
    needUpdate && core.setOutput('dependencies', updateInfos)
  }
  catch (error: any) {
    core.setFailed(error.message)
  }
}
