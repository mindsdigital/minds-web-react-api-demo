import OggOpusWasm from "opus-media-recorder/OggOpusEncoder.wasm?url";
import EncoderWorker from "opus-media-recorder/encoderWorker.umd.js?worker";
import { useRef } from "react";
import {
  Recorder as MediaRecorder,
  RecorderDefinition
} from "@/lib/opusMediaRecorder";

export type ReactMediaRecorderRenderProps = {
  startRecording: () => void;
  stopRecording: () => void;
};

export type ReactMediaRecorderHookProps = {
  onStop?: (base64: string) => void;
  onStart?: () => void;
  blobPropertyBag?: BlobPropertyBag;
  customMediaStream?: MediaStream | null;
  stopStreamsOnStop?: boolean;
  askPermissionOnMount?: boolean;
  onPermissionDenied?: () => void;
};

const workerOptions = {
  encoderWorkerFactory: () => new EncoderWorker(),
  OggOpusEncoderWasmPath: OggOpusWasm
};

export default function useMediaRecorder({
  onStop = () => null,
  onStart = () => null,
  blobPropertyBag,
  onPermissionDenied = () => null
}: ReactMediaRecorderHookProps): ReactMediaRecorderRenderProps {
  const mediaChunks = useRef<Uint8Array[]>([]);

  const rec = useRef<RecorderDefinition | null>(null);

  const startRecording = async () => {
    try {
      mediaChunks.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });

      const options = { mimeType: blobPropertyBag?.type };
      const recorder = new MediaRecorder(stream, options, workerOptions);

      recorder.start();

      recorder.addEventListener("dataavailable", (e: Event) =>
        onRecordingActive((e as unknown as { data: Uint8Array }).data)
      );
      recorder.addEventListener("start", () => onRecordingStart());
      recorder.addEventListener("stop", () => onRecordingStop());

      rec.current = recorder;
    } catch (e) {
      onPermissionDenied();
    }
  };

  const stopRecording = () => {
    rec.current?.stop();
  };

  const onRecordingActive = (data: Uint8Array) => {
    mediaChunks.current.push(data);
  };

  const onRecordingStart = () => {
    onStart();
  };

  const onRecordingStop = () => {
    const reader = new FileReader();
    const blob = new Blob(mediaChunks.current, blobPropertyBag);

    reader.readAsDataURL(blob);

    reader.onloadend = () => {
      const base64 = reader.result?.toString() ?? "";
      const base64Data = base64.split(",")[1];

      onStop(base64Data);
      mediaChunks.current = [];
    };
  };

  return {
    startRecording,
    stopRecording
  };
}
