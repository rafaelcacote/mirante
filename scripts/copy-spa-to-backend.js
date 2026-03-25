#!/usr/bin/env node
/**
 * Copia o build do Vue (dist/) para backend/public para deploy único.
 * - dist/index.html -> backend/public/index.html (SPA)
 * - dist/assets/*   -> backend/public/assets/
 * - dist/favicon.ico -> backend/public/favicon.ico (se existir)
 * NÃO sobrescreve index.php (Laravel).
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const dist = path.join(root, 'dist')
const publicDir = path.join(root, 'backend', 'public')

function copyRecursive(src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name))
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
    console.log('  ', path.relative(publicDir, dest))
  }
}

if (!fs.existsSync(dist)) {
  console.error('Erro: pasta dist/ não encontrada. Rode "npm run build" antes.')
  process.exit(1)
}

if (!fs.existsSync(publicDir)) {
  console.error('Erro: backend/public não encontrado.')
  process.exit(1)
}

console.log('Copiando SPA para backend/public...')

if (fs.existsSync(path.join(dist, 'index.html'))) {
  fs.copyFileSync(path.join(dist, 'index.html'), path.join(publicDir, 'index.html'))
  console.log('  index.html')
}

const distAssets = path.join(dist, 'assets')
if (fs.existsSync(distAssets)) {
  const destAssets = path.join(publicDir, 'assets')
  if (fs.existsSync(destAssets)) {
    fs.rmSync(destAssets, { recursive: true })
  }
  copyRecursive(distAssets, destAssets)
}

const favicon = path.join(dist, 'favicon.ico')
if (fs.existsSync(favicon)) {
  fs.copyFileSync(favicon, path.join(publicDir, 'favicon.ico'))
  console.log('  favicon.ico')
}

console.log('Concluído. Frontend em backend/public (index.html + assets/).')
