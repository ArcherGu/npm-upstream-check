"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/main.ts
var import_core = __toESM(require("@actions/core"), 1);
var import_npm_check_updates = require("npm-check-updates");
async function run(cwd) {
  try {
    const upstreamDeps = import_core.default.getInput("upstream", { required: true }).trim().split(",");
    const deep = import_core.default.getInput("deep", { required: false }) === "true";
    const checkOnly = import_core.default.getInput("check-only", { required: false }) === "true";
    const allDeps = import_core.default.getInput("all", { required: false }) === "true";
    import_core.default.debug(`upstream npm dependencies: ${upstreamDeps.join(", ")}`);
    const updateInfos = {};
    const result = await (0, import_npm_check_updates.run)({
      deep,
      cwd,
      filterResults: (packageName) => {
        if (allDeps) {
          return true;
        }
        return upstreamDeps.includes(packageName);
      },
      upgrade: !checkOnly
    });
    if (!result) {
      import_core.default.setOutput("need-update", false);
      return;
    }
    for (const key in result) {
      if (deep) {
        for (const pkgName in result[key]) {
          if (allDeps || upstreamDeps.includes(pkgName)) {
            updateInfos[pkgName] = result[key][pkgName];
          }
        }
      } else {
        if (allDeps || upstreamDeps.includes(key)) {
          updateInfos[key] = result[key];
        }
      }
    }
    const needUpdate = Object.keys(updateInfos).length > 0;
    import_core.default.setOutput("need-update", needUpdate);
    needUpdate && import_core.default.setOutput("dependencies", updateInfos);
  } catch (error) {
    import_core.default.setFailed(error.message);
  }
}

// src/index.ts
run();
