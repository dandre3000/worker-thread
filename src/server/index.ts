import { isMainThread, parentPort, Worker } from 'node:worker_threads'
import { setRuntimeVariables, WorkerThread } from '../WorkerThread.ts'
import { Thread, threadScriptImportedRecord, workerSetupMessageListener } from '../Thread.ts'

setRuntimeVariables(
    isMainThread,
    Worker,
    new URL(import.meta.url)
)

if (isMainThread) {
    threadScriptImportedRecord.value = true
} else {
    (parentPort as NonNullable<typeof parentPort>).once('message', workerSetupMessageListener)
}

export { Thread, WorkerThread }