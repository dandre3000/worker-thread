import type { UUID } from 'node:crypto'
import type { Worker as NodeWorker } from 'node:worker_threads'
import {
    ClosePortMessage,
    moduleSymbol,
    newThreadPortRecord,
    Thread,
    ThreadMessage,
    WorkerSetupMessage
} from './Thread.ts'

interface OpenPortMessage extends ThreadMessage {
    handlerId: 'openPort'
    args: [UUID, MessagePort]
}

export let setWorker = null as any as (constructor: typeof Worker | typeof NodeWorker) => void
export let setWorkerURL = null as any as (url: string | URL) => void

export class WorkerThread extends Thread {
    static #Worker = (() => {
        setWorker = constructor => WorkerThread.#Worker = constructor

        return null as any as typeof Worker | typeof NodeWorker
    })()

    static #workerURL = (() => {
        setWorkerURL = url => WorkerThread.#workerURL = url

        return null as any as string | URL
    })()

    #port: MessagePort
    #worker: Worker | NodeWorker
    #connectedWorkerThreads = new Set<WorkerThread>
    declare id: UUID

    constructor (scriptURL: string | URL) {
        const worker = new WorkerThread.#Worker(WorkerThread.#workerURL, { type: 'module' })
        const { port1, port2 } = new MessageChannel
        const id = crypto.randomUUID()

        const workerSetupMessage: WorkerSetupMessage = {
            workerId: id,
            parentId: Thread.id,
            port: port2,
            scriptURL: String(scriptURL)
        }

        worker.postMessage(workerSetupMessage, [port2 as any])

        // @ts-expect-error
        super(moduleSymbol, id, port1)
        this.#port = newThreadPortRecord.value
        newThreadPortRecord.value = null as any
        this.#worker = worker
    }

    openPort (thread: WorkerThread) {
        const { port1, port2 } = new MessageChannel
        const openPortMessage: OpenPortMessage = {
            handlerId: 'openPort',
            args: [thread.id, port1]
        }

        this.#port.postMessage(openPortMessage, [port1])

        openPortMessage.args[0] = this.id
        openPortMessage.args[1] = port2

        thread.#port.postMessage(openPortMessage, [port2])

        this.#connectedWorkerThreads.add(thread)
        thread.#connectedWorkerThreads.add(this)
    }

    closePort (thread: WorkerThread) {
        const closePortMessage: ClosePortMessage = {
            handlerId: 'closePort',
            args: [this.id]
        }

        this.#port.postMessage(closePortMessage)
        thread.#port.postMessage(closePortMessage)

        this.#connectedWorkerThreads.delete(thread)
        thread.#connectedWorkerThreads.delete(this)
    }

    getConnectedWorkers () {
        return [...this.#connectedWorkerThreads.values()]
    }

    terminate () {
        this.#worker.terminate()
        this.closePort(this)

        const closePortMessage: ClosePortMessage = {
            handlerId: 'closePort',
            args: [this.id]
        }

        for (const thread of this.#connectedWorkerThreads) {
            thread.#port.postMessage(closePortMessage)
        }

        this.#connectedWorkerThreads.clear()
    }
}