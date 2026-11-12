import { isMainThread, parentPort, Worker } from 'node:worker_threads'
import { setWorker, setWorkerURL, WorkerThread } from '../WorkerThread.ts'
import { Thread, threadScriptImportedRecord, workerSetupMessageListener } from '../Thread.ts'

Thread.isMainThread = isMainThread
setWorker(Worker)
setWorkerURL(import.meta.url)

if (isMainThread) {
    threadScriptImportedRecord.value = true
} else {
    (parentPort as NonNullable<typeof parentPort>).once('message', workerSetupMessageListener)
}

export { Thread, WorkerThread }