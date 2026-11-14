import { setRuntimeVariables, WorkerThread } from '../WorkerThread.ts'
import { Thread, threadScriptImportedRecord, workerSetupMessageListener } from '../Thread.ts'

setRuntimeVariables(
    typeof globalThis.Window === 'function' && globalThis instanceof Window,
    Worker,
    import.meta.url
)

if (Thread.isMainThread) {
    threadScriptImportedRecord.value = true
} else {
    addEventListener('message',
        ({ data }) => workerSetupMessageListener(data), { capture: true, once: true }
    )
}

export { Thread, WorkerThread }