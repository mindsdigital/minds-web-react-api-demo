/* eslint-disable @typescript-eslint/naming-convention */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import MediaRecorder from 'opus-media-recorder';

interface WorkerOptions {
    encoderWorkerFactory: () => Worker;
    OggOpusEncoderWasmPath?: string;
    WebMOpusEncoderWasmPath?: string;
}

declare class RecorderDefinition extends EventTarget {
    constructor(
        stream: MediaStream,
        options: MediaRecorderOptions,
        workerOptions: WorkerOptions,
    );

    pause(): void;

    resume(): void;

    stop(): void;

    start(): void;

    static isTypeSupported(mimeType: string): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const Recorder: typeof RecorderDefinition = MediaRecorder;

export { Recorder, RecorderDefinition };
