
import EventEmitter from 'node:events'
import type { Transferable as NodeTransferable, Worker as NodeWorker } from 'node:worker_threads'

export type PromiseExecutor<T = unknown> = ConstructorParameters<typeof Promise<T>>[0]
export type PromiseResolve<T = unknown> = Parameters<PromiseExecutor<T>>[0]
export type PromiseReject = Parameters<PromiseExecutor<any>>[1]
export type PromiseWithResolvers<T = unknown> = ReturnType<typeof Promise.withResolvers<T>>

export type UUID = ReturnType<Crypto['randomUUID']>

export type PortTransferable = (Transferable & NodeTransferable)[]

export type Port = (EventTarget | EventEmitter) & {
    postMessage: ((message: any, transfer: PortTransferable) => void)
}

export const moduleSymbol = Symbol()

export let EventEmitterRecord = { value: null as typeof EventEmitter | null } as const
export let isMainThreadRecord = { value: null as any as boolean } as const
export let WorkerRecord = { value: null as any as typeof Worker | typeof NodeWorker } as const

if (process.env.NODE_ENV === 'development') {
    Object.defineProperty(EventEmitterRecord, 'value', {
        get: () => {
            throw new Error
        },
        set: (EventEmitterConstructor: typeof EventEmitter | null) => {
            if (typeof EventEmitterConstructor === 'function') {
                Reflect.construct(Object, [], EventEmitterConstructor)

                if (
                    typeof EventEmitterConstructor.prototype.addListener !== 'function' ||
                    typeof EventEmitterConstructor.prototype.emit !== 'function' ||
                    // !(EventEmitterConstructor.prototype.eventNames instanceof Array) ||
                    typeof EventEmitterConstructor.prototype.getMaxListeners !== 'function' ||
                    typeof EventEmitterConstructor.prototype.listenerCount !== 'function' ||
                    typeof EventEmitterConstructor.prototype.listeners !== 'function' ||
                    typeof EventEmitterConstructor.prototype.off !== 'function' ||
                    typeof EventEmitterConstructor.prototype.on !== 'function' ||
                    typeof EventEmitterConstructor.prototype.once !== 'function' ||
                    typeof EventEmitterConstructor.prototype.prependListener !== 'function' ||
                    typeof EventEmitterConstructor.prototype.prependOnceListener !== 'function' ||
                    typeof EventEmitterConstructor.prototype.rawListeners !== 'function' ||
                    typeof EventEmitterConstructor.prototype.removeAllListeners !== 'function' ||
                    typeof EventEmitterConstructor.prototype.removeListener !== 'function' ||
                    typeof EventEmitterConstructor.prototype.setMaxListeners !== 'function'
                ) throw new TypeError
            } else if (EventEmitterConstructor !== null)
                throw new TypeError

            const _EventEmitterRecord = {
                value: EventEmitterConstructor
            }

            Object.defineProperty(_EventEmitterRecord, 'value', {
                value: EventEmitterConstructor
            })

            EventEmitterRecord = _EventEmitterRecord
        }
    })

    Object.defineProperty(isMainThreadRecord, 'value', {
        get: () => {
            throw new Error
        },
        set: (isMainThread: boolean) => {
            if (isMainThread !== true && isMainThread !== false)
                throw new TypeError('isMainThread must equal true or false')

            const _isMainThreadRecord = {
                value: isMainThread
            }

            Object.defineProperty(_isMainThreadRecord, 'value', {
                value: isMainThread
            })

            isMainThreadRecord = _isMainThreadRecord
        }
    })

    Object.defineProperty(WorkerRecord, 'value', {
        get: () => {
            throw new Error
        },
        set: (WorkerConstructor: typeof Worker | typeof NodeWorker) => {
            Reflect.construct(Object, [], WorkerConstructor)

            if (
                typeof WorkerConstructor.prototype.postMessage !== 'function' ||
                typeof WorkerConstructor.prototype.terminate !== 'function' || (
                    !(WorkerConstructor.prototype instanceof EventTarget) && (
                        EventEmitterRecord.value === null ||
                        !(WorkerConstructor.prototype instanceof EventEmitterRecord.value)
                    )
                )
            ) throw new TypeError

            const _WorkerRecord = {
                value: WorkerConstructor
            }

            Object.defineProperty(_WorkerRecord, 'value', {
                value: WorkerConstructor
            })

            WorkerRecord = _WorkerRecord
        }
    })
}