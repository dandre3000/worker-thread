# worker-thread

Provides a consistent interface for using Workers on a web browser, node, bun or deno.

## Installation

```bash
npm install @dandre3000/worker-thread
```

## Usage

```js
import { Thread, WorkerThread } from '@dandre3000/worker-thread'

Thread.onopenport = thread => {
    console.log(`${Thread.id}: Thread ${thread.id} connected`)
}

if (Thread.isMainThread) {
    const worker1 = new WorkerThread(new URL(import.meta.url))
    const worker2 = new WorkerThread(new URL(import.meta.url))

    worker1.openPort(worker2)
}
```

## Exports

### Class: Thread

#### static isMainThread: boolean
True if the current global scope is the main thread or false otherwise.

#### static id: UUID | "main"
Identifier for the current thread.

#### static parentThread: Thread | null
The Thread instance for the parent thread. Is null on the main thread.

#### static onopenport: ((thread: Thread) => void) | null
A function that is called every time another thread is connected to the current one.

#### static close (): never
Alias for globalThis.close or process.exit.

#### static getConnectedThreads(): Thread[]
Returns an array including the parentThread and all workers that were connected to the current thread using WorkerThread.prototype.openPort.

#### id: UUID | "main"
Identifier for the thread associated with this instance.

#### constructor ()
Illegal constructor. All Thread instances must be created using new WorkerThread or WorkerThread.prototype.openPort.

#### onmessage: Function | null
A function that is called every time a message is sent from the thread associated with this instance to the current one using Thread.prototype.postMessage.

#### oncloseport: ((thread: Thread) => void) | null
A function that is called when the port connecting the current thread to the one associated with this instance has closed.

#### postMessage (message: any, transfers?: Transferable[] | import("node:worker_threads").Transferable[]): void
Send a message to the thread associated with this instance.

#### closePort (): void
Closes the channel connecting the current thread with the one associated with this instance.

### Class: WorkerThread

#### constructor (scriptURL: string | URL)

#### openPort (thread: Thread): void
Creates a channel between two workers and a Thread instance on each representing its connection to the other.

#### getConnectedWorkers (): WorkerThread[]
Returns an array of all workers connected to this.
#### terminate (): void
Terminate the thread.

## License

[MIT](https://github.com/dandre3000/worker-thread/blob/main/LICENSE)
