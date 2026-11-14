import type { UUID } from 'node:crypto'
import type { Transferable as NodeTransferable } from 'node:worker_threads'

export type ThreadConstructor = new (symbol: typeof moduleSymbol, id: UUID | 'main', port: MessagePort) => Thread

interface ThreadEventListenerObject extends EventListenerObject {
    thread: Thread
}

export interface WorkerSetupMessage {
    parentId: UUID | 'main'
    workerId: UUID
    port: MessagePort
    scriptURL: string
}

export interface ThreadMessage {
    handlerId: number | string
    args?: any[]
}

interface UserMessage extends ThreadMessage {
    handlerId: 'postMessage',
    args: [any]
}

export interface ClosePortMessage extends ThreadMessage {
    handlerId: 'closePort'
    args?: [UUID]
}

export const moduleSymbol = Symbol()
export let threadScriptImportedRecord = { value: false }
const threadPorts: MessagePort[] = []
export let openPort: (_: null, id: UUID | 'main', port: MessagePort) => Thread
let startPorts: () => void

const close = globalThis.process ? process.exit : globalThis.close

export let newThreadPortRecord = { value: null as any as MessagePort }

export class Thread {
    static #connectedIdToThreadMap = new Map<UUID | 'main', Thread>
    static #onOpenPortHandler: ((thread: Thread) => void) | null = null

    static #openPort = openPort = (_, id, port) => {
        const thread = new (Thread as ThreadConstructor)(moduleSymbol, id, port)

        Thread.#connectedIdToThreadMap.set(id, thread)
        if (threadScriptImportedRecord.value) Thread.#onOpenPortHandler?.(thread)

        return thread
    }

    static #startPorts = startPorts = () => {
        threadScriptImportedRecord.value = true

        for (const [id, thread] of Thread.#connectedIdToThreadMap) {
            thread.#port.start()
            Thread.#onOpenPortHandler?.(thread)
        }
    }

    static #postMessage = (thread: Thread, message: any) => {
        thread.#onMessageHandler?.(message)
    }

    static #idToHandlerMap = new Map<number | string, Function>([
        ['openPort', Thread.#openPort],
        ['closePort', (thread: Thread, id?: UUID) => {
            if (id) thread = this.#connectedIdToThreadMap.get(id) as Thread

            thread.closePort()
        }],
        ['postMessage', Thread.#postMessage]
    ])

    static #messageListener = function (this: ThreadEventListenerObject, event: MessageEvent<ThreadMessage>) {
        const handler = Thread.#idToHandlerMap.get(event.data.handlerId)
        if (process.env.NODE_ENV === 'development') {
            if (!handler) throw new Error
        }

        if (event.data.args)
            (handler as Function)(this.thread, ...event.data.args)
        else
            (handler as Function)(this.thread)
    }

    static id: UUID | 'main' = 'main'
    static parentThread: Thread | null = null
    static isMainThread = false

    static get onopenport () {
        return Thread.#onOpenPortHandler
    }

    static set onopenport (handler: ((thread: Thread) => void) | null) {
        if (typeof handler !== 'function') handler = null

        Thread.#onOpenPortHandler = handler
    }

    static getConnectedThreads () {
        return [...this.#connectedIdToThreadMap.values()]
    }

    static close = () => {
        const message: ClosePortMessage = { handlerId: 'closePort' }

        for (const [id, thread] of this.#connectedIdToThreadMap) {
            thread.#port.postMessage(message)
        }

        return close() as never
    }

    #port: MessagePort
    #onMessageHandler: Function | null = null
    #onClosePortHandler: ((thread: Thread) => void) | null = null

    #messageListenerObject: ThreadEventListenerObject = {
        thread: this,
        handleEvent: Thread.#messageListener
    }

    id: UUID | 'main'

    constructor () {
        const [symbol, id, port] = arguments as any as [symbol: typeof moduleSymbol, id: UUID | 'main', port: MessagePort]
        if (symbol !== moduleSymbol) throw new Error('Illegal constructor')

        port.addEventListener('message', this.#messageListenerObject, true)
        if (threadScriptImportedRecord.value)
            port.start()
        else
            threadPorts.push(port)

        this.id = id
        this.#port = port
        if (new.target !== Thread) newThreadPortRecord.value = port
    }

    get onmessage () { return Thread.#onOpenPortHandler }

    set onmessage (handler: Function | null) {
        if (typeof handler !== 'function') handler = null

        this.#onMessageHandler = handler
    }

    get oncloseport () {
        return this.#onClosePortHandler
    }

    set oncloseport (handler: ((thread: Thread) => void) | null) {
        if (typeof handler !== 'function') handler = null

        this.#onClosePortHandler = handler
    }

    postMessage (message: any, transfers?: Transferable[] | NodeTransferable[]) {
        const userMessage: UserMessage = {
            handlerId: 'postMessage',
            args: [message]
        }

        this.#port.postMessage(userMessage, transfers as any)
    }

    closePort () {
        this.#port.close()
        this.#port.removeEventListener('message', this.#messageListenerObject, true)
        Thread.#connectedIdToThreadMap.delete(this.id)
        this.#onClosePortHandler?.(this)
    }
}

export let workerSetupMessageListener = (message: WorkerSetupMessage) => {
    Thread.id = message.workerId
    Thread.parentThread = openPort(null, message.parentId, message.port)

    import(message.scriptURL).finally(() => {
        startPorts()
    })
}