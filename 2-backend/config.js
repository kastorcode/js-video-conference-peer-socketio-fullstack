import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'


export const HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS, POST'
}

export const PORT = process.env.PORT || 3000

export const SOCKET_OPTIONS = {
  cors: {
    origin: '*',
    credentials: false
  }
}

export const getSsl = () => {
  return {
    cert: readFileSync(join(homedir(), '.ssl', 'cert.pem')),
    key: readFileSync(join(homedir(), '.ssl', 'key.pem'))
  }
}