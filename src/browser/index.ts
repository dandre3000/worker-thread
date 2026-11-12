import { setWorker, setWorkerURL, WorkerThread } from '../WorkerThread.ts'
import { Thread, threadScriptImportedRecord, workerSetupMessageListener } from '../Thread.ts'

Thread.isMainThread = typeof globalThis.Window === 'function' && globalThis instanceof Window
setWorker(Worker)
setWorkerURL(import.meta.url)

if (Thread.isMainThread) {
    threadScriptImportedRecord.value = true
} else {
    addEventListener('message',
        ({ data }) => workerSetupMessageListener(data), { capture: true, once: true }
    )
}

export { Thread, WorkerThread }