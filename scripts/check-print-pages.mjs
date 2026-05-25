import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const url = process.argv[2] ?? 'http://127.0.0.1:4173/'
const expectedPages = Number(process.argv[3] ?? 2)

const tmpRoot = mkdtempSync(join(tmpdir(), 'new-resume-print-'))
const userDataDir = join(tmpRoot, 'chrome-profile')
const pdfPath = join(tmpRoot, 'resume.pdf')
const timeoutMs = 15_000
let chrome

try {
  chrome = spawn(
    chromePath,
    [
      '--headless=new',
      '--disable-background-networking',
      '--disable-breakpad',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-gpu',
      '--disable-sync',
      '--metrics-recording-only',
      '--no-first-run',
      '--no-sandbox',
      `--user-data-dir=${userDataDir}`,
      `--print-to-pdf=${pdfPath}`,
      url,
    ],
    { stdio: 'ignore' }
  )

  const pdf = await waitForPdf(pdfPath, timeoutMs)

  const pages = pdf.match(/\/Type\s*\/Page\b/g)?.length ?? 0

  console.log(`print pages: ${pages}`)

  if (pages !== expectedPages) {
    process.exitCode = 1
  }
} finally {
  await stopProcess(chrome)
  rmSync(tmpRoot, { force: true, maxRetries: 5, recursive: true, retryDelay: 100 })
}

async function waitForPdf(path, timeout) {
  const startedAt = Date.now()
  let lastSize = 0
  let stableReads = 0

  while (Date.now() - startedAt < timeout) {
    await delay(250)

    if (!existsSync(path)) {
      continue
    }

    const pdf = readFileSync(path, 'latin1')
    const currentSize = pdf.length

    stableReads = currentSize === lastSize ? stableReads + 1 : 0
    lastSize = currentSize

    if (stableReads >= 1 && pdf.includes('%%EOF')) {
      return pdf
    }
  }

  throw new Error(`Chrome did not write a complete PDF within ${timeout}ms`)
}

async function stopProcess(process) {
  if (!process || process.exitCode !== null || process.signalCode !== null) {
    return
  }

  process.kill('SIGTERM')

  try {
    await Promise.race([
      new Promise((resolve) => process.once('exit', resolve)),
      delay(2_000).then(() => {
        process.kill('SIGKILL')
      }),
    ])
  } catch {
    process.kill('SIGKILL')
  }
}
