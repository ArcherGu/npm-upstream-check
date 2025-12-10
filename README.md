# Npm Upstream Check

[![CI](https://github.com/ArcherGu/npm-upstream-check/actions/workflows/ci.yml/badge.svg)](https://github.com/ArcherGu/npm-upstream-check/actions/workflows/ci.yml)  

## Usage

Your npm package may depend on another npm package, and when the upstream package is updated, you may need to make some changes, and this action can help you.

## Example
  
  ```yaml
  - name: Check npm upstream
    id: cnu
    uses: ArcherGu/npm-upstream-check@v1
    with:
      upstream: esbuild
    
  - name: Get the outputs
    run: |
      echo "Need Update: ${{ steps.cnu.outputs.need-update }}"
      echo "Dependencies: ${{ steps.cnu.outputs.dependencies }}"
  ```

## Inputs
  - `upstream`: The upstream package name
    - required
    - example: `esbuild` or `esbuild,rollup`
  - `check-only`: Only check, not update package.json
    - optional
    - default: `false`
  - `ncu-options`: The options for npm-check-updates
    - optional
    - default: `{}`
    - example: `{"deep": true}`
    - available options: [npm-check-updates options](https://github.com/raineorshine/npm-check-updates#options)
  - `all`: Check all dependencies, not just upstream
    - optional
    - default: `false`

## Outputs
  - `need-update`: Whether the dependencies need to be updated
    - example: `true` or `false`
  - `dependencies`: The dependencies that need to be updated, in JSON string format
    - example: `{"esbuild": "^0.13.0"}`


## License

MIT License © 2023 [Archer Gu](https://github.com/archergu)
