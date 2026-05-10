#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import yaml from 'yamljs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');
const appFile = path.join(repoRoot, 'src/app.js');
const swaggerFile = path.join(repoRoot, 'swagger.yaml');
const routeMethods = ['get', 'post', 'put', 'patch', 'delete'];
const args = process.argv.slice(2);

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function getArgValue(name) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  return args[index + 1] || null;
}

function hasArg(name) {
  return args.includes(name);
}

function normalizePath(value) {
  let result = value.trim();
  result = result.replace(/\/+/g, '/');
  result = result.replace(/\/$/, '') || '/';
  result = result.replace(/^\/api(?=\/|$)/, '');
  result = result.replace(/:([A-Za-z0-9_]+)/g, '{$1}');
  result = result.replace(/\{[^}]+\}/g, '{param}');
  return result;
}

function joinPaths(prefix, routePath) {
  const normalizedPrefix = prefix === '/' ? '' : prefix;
  const normalizedRoutePath = routePath === '/' ? '' : routePath;
  return normalizePath(`${normalizedPrefix}${normalizedRoutePath}` || '/');
}

function extractAppMounts() {
  const source = stripComments(read(appFile));
  const requireMap = new Map();
  const requirePattern = /const\s+(\w+)\s*=\s*require\(["']\.\/routes\/([^"']+)["']\);/g;
  const mountPattern = /app\.use\(["']([^"']+)["']\s*,\s*(\w+)\)/g;
  const appRoutePattern = /app\.(get|post|put|patch|delete)\(["']([^"']+)["']/g;

  let match;
  while ((match = requirePattern.exec(source))) {
    requireMap.set(match[1], `${match[2]}.js`);
  }

  const mounts = [];
  while ((match = mountPattern.exec(source))) {
    const [, prefix, variableName] = match;
    const routeFile = requireMap.get(variableName);
    if (!routeFile) continue;
    mounts.push({
      prefix,
      routeFile: path.join(repoRoot, 'src/routes', routeFile),
      variableName,
    });
  }

  const directRoutes = [];
  while ((match = appRoutePattern.exec(source))) {
    const [, method, routePath] = match;
    directRoutes.push({
      method: method.toUpperCase(),
      path: normalizePath(routePath),
      source: 'src/app.js',
    });
  }

  return { mounts, directRoutes };
}

function extractRouterRoutes(routeFile, prefix) {
  const source = stripComments(read(routeFile));
  const routes = [];
  const sourceLabel = path.relative(repoRoot, routeFile);

  for (const method of routeMethods) {
    const directPattern = new RegExp(`router\\.${method}\\s*\\(\\s*["']([^"']+)["']`, 'g');
    let match;
    while ((match = directPattern.exec(source))) {
      routes.push({
        method: method.toUpperCase(),
        path: joinPaths(prefix, match[1]),
        source: sourceLabel,
      });
    }
  }

  const routeChainPattern = /router\.route\s*\(\s*["']([^"']+)["']\s*\)([\s\S]*?)(?=router\.|module\.exports|$)/g;
  let chainMatch;
  while ((chainMatch = routeChainPattern.exec(source))) {
    const [, routePath, chain] = chainMatch;
    for (const method of routeMethods) {
      if (new RegExp(`\\.${method}\\s*\\(`).test(chain)) {
        routes.push({
          method: method.toUpperCase(),
          path: joinPaths(prefix, routePath),
          source: sourceLabel,
        });
      }
    }
  }

  return routes;
}

function extractExpressRoutes() {
  const { mounts, directRoutes } = extractAppMounts();
  const routes = [...directRoutes];

  for (const mount of mounts) {
    if (!fs.existsSync(mount.routeFile)) {
      routes.push({
        method: 'MISSING',
        path: normalizePath(mount.prefix),
        source: `${mount.variableName} -> missing route file`,
      });
      continue;
    }
    routes.push(...extractRouterRoutes(mount.routeFile, mount.prefix));
  }

  const byKey = new Map();
  for (const route of routes) {
    byKey.set(`${route.method} ${route.path}`, route);
  }
  return [...byKey.values()].sort((a, b) => `${a.path} ${a.method}`.localeCompare(`${b.path} ${b.method}`));
}

function extractOpenApiRoutes() {
  const document = yaml.load(swaggerFile);
  const routes = [];

  for (const [swaggerPath, operations] of Object.entries(document.paths || {})) {
    for (const method of routeMethods) {
      if (!operations[method]) continue;
      routes.push({
        method: method.toUpperCase(),
        path: normalizePath(swaggerPath),
        source: 'swagger.yaml',
      });
    }
  }

  return routes.sort((a, b) => `${a.path} ${a.method}`.localeCompare(`${b.path} ${b.method}`));
}

function toKey(route) {
  return `${route.method} ${route.path}`;
}

function routeMatchesPattern(route, pattern) {
  if (!pattern) return false;
  if (pattern.method && pattern.method !== '*' && pattern.method.toUpperCase() !== route.method) {
    return false;
  }
  if (pattern.path && pattern.path !== route.path) {
    return false;
  }
  return true;
}

function readAllowlist(allowlistPath) {
  if (!allowlistPath) {
    return { allowed: [] };
  }

  const resolvedPath = path.resolve(repoRoot, allowlistPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Allowlist does not exist: ${resolvedPath}`);
  }

  const parsed = JSON.parse(read(resolvedPath));
  if (!Array.isArray(parsed.allowed)) {
    throw new Error(`Allowlist must have an "allowed" array: ${resolvedPath}`);
  }

  return parsed;
}

function splitAllowed(routes, side, allowlist) {
  const allowed = [];
  const actionable = [];

  for (const route of routes) {
    const match = allowlist.allowed.find((entry) => {
      if (entry.side && entry.side !== side) return false;
      return routeMatchesPattern(route, entry);
    });

    if (match) {
      allowed.push({
        ...route,
        allowReason: match.reason || 'allowlisted',
      });
    } else {
      actionable.push(route);
    }
  }

  return { allowed, actionable };
}

function main() {
  const allowlistPath = getArgValue('--allowlist');
  const writePath = getArgValue('--write');
  const strict = hasArg('--strict');
  const includeAll = hasArg('--include-all');
  const allowlist = readAllowlist(allowlistPath);

  const expressRoutes = extractExpressRoutes();
  const openApiRoutes = extractOpenApiRoutes();
  const expressKeys = new Map(expressRoutes.map((route) => [toKey(route), route]));
  const openApiKeys = new Map(openApiRoutes.map((route) => [toKey(route), route]));

  const onlyInExpress = expressRoutes.filter((route) => !openApiKeys.has(toKey(route)));
  const onlyInOpenApi = openApiRoutes.filter((route) => !expressKeys.has(toKey(route)));
  const expressDrift = splitAllowed(onlyInExpress, 'onlyInExpress', allowlist);
  const openApiDrift = splitAllowed(onlyInOpenApi, 'onlyInOpenApi', allowlist);

  const report = {
    generatedAt: new Date().toISOString(),
    counts: {
      express: expressRoutes.length,
      openapi: openApiRoutes.length,
      onlyInExpress: onlyInExpress.length,
      onlyInOpenApi: onlyInOpenApi.length,
      allowedOnlyInExpress: expressDrift.allowed.length,
      allowedOnlyInOpenApi: openApiDrift.allowed.length,
      actionableOnlyInExpress: expressDrift.actionable.length,
      actionableOnlyInOpenApi: openApiDrift.actionable.length,
    },
    allowlist: {
      path: allowlistPath || null,
      entries: allowlist.allowed.length,
    },
    onlyInExpress,
    onlyInOpenApi,
    allowedOnlyInExpress: expressDrift.allowed,
    allowedOnlyInOpenApi: openApiDrift.allowed,
    actionableOnlyInExpress: expressDrift.actionable,
    actionableOnlyInOpenApi: openApiDrift.actionable,
  };

  if (includeAll) {
    report.expressRoutes = expressRoutes;
    report.openApiRoutes = openApiRoutes;
  }

  const output = JSON.stringify(report, null, 2);
  if (writePath) {
    const resolvedWritePath = path.resolve(repoRoot, writePath);
    fs.mkdirSync(path.dirname(resolvedWritePath), { recursive: true });
    fs.writeFileSync(resolvedWritePath, `${output}\n`);
  }

  console.log(output);

  if (strict && (expressDrift.actionable.length > 0 || openApiDrift.actionable.length > 0)) {
    process.exitCode = 1;
  }
}

main();
