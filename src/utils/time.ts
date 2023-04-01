// A function to stop an async thread for a few miliseconds
export function sleep(ms: number): Promise<() => void> {
  return new Promise(
      resolve => setTimeout(resolve as () => void, ms),
  )
}

// A function that rejects a promise after a few miliseconds
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutError = new Error('Promise timed out'),
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(timeoutError), ms)

    promise.then(
        (value) => {
          clearTimeout(timeout)
          resolve(value)
        },
        (error) => {
          clearTimeout(timeout)
          reject(error)
        },
    )
  })
}
