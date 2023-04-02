import { Storage } from './storage'
import fs from 'fs/promises'
import path from 'path'

export class FSStorage implements Storage {
  constructor(
    private readonly path: string,
  ) { }

  setItem(key: string, value: string): Promise<void> {
    return fs.mkdir(this.path, { recursive: true })
      .then(() => fs.writeFile(path.join(this.path, key), value))
  }

  getItem(key: string): Promise<string | null> {
    return fs.readFile(path.join(this.path, key))
      .then((data) => data.toString())
      .catch(() => null)
  }

  removeItem(key: string): Promise<void> {
    return fs.unlink(path.join(this.path, key))
  }

  removeSession(): Promise<void> {
    return fs.rm(this.path, { recursive: true })
  }
}
