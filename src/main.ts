import type { RunOptions } from 'npm-check-updates'
import * as core from '@actions/core'
import ncu from 'npm-check-updates'

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
    const ncuOptionsJson = core.getInput('ncu-options', { required: false }) || '{}'
    const ncuOptions = parseNcuOptions(ncuOptionsJson) as RunOptions

    core.debug(`upstream dependencies: ${upstreamDeps.join(', ')}`)
    if (ncuOptions.packageManager) {
      core.debug(`package manager: ${ncuOptions.packageManager}`)
    }
    if (ncuOptions.workspaces) {
      core.debug('ncu: workspaces mode enabled')
    }

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
      if (typeof result[key] === 'object') {
        for (const pkgName in result[key]) {
          if (allDeps || upstreamDeps.includes(pkgName))
            updateInfos[pkgName] = result[key][pkgName]
        }
      }
      else {
        if (allDeps || upstreamDeps.includes(key))
          updateInfos[key] = result[key]
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
