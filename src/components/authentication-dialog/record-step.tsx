import { ROUTES_PREFIX } from "@/lib/config";
import { Loader2, Mic } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  DialogHeader,
  DialogFooter,
  DialogClose,
  DialogDescription,
  DialogTitle
} from "../ui/dialog";
import useAudioRecorder from "@/hooks/useAudioRecorder";
import { useCountdown } from "usehooks-ts";
import { validateBiometricsResponse } from "./validation";
import { PaperPlaneIcon } from "@radix-ui/react-icons";

const errors = {
  spoof: "Aparentemente esse áudio não é legítimo e é um possível spoof de voz",
  blocklist:
    "Identificamos que essa voz/telefone está com um bloqueio em nossa base de dados",
  audio_too_large:
    "Seu áudio está muito longo. Por favor, grave um áudio lendo o texto sugerido",
  audio_already_used:
    "Esse áudio já foi utilizado em uma operação anteriormente. Por favor, grave um novo áudio",
  generic_error:
    "Ops! A autenticação falhou. Preciso que fale um pouco mais devagar. Por favor, grave o áudio novamente"
};

const MIN_LENGTH = 5;

interface Props {
  token: string;
  onSuccess: () => void;
  enrollment?: boolean;
  document: string;
  phone: string;
}

export default function RecordStep({
  token,
  onSuccess,
  enrollment,
  document,
  phone
}: Props) {
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showRequestPermission, setShowRequestPermission] = useState(false);

  const [timer, { startCountdown, resetCountdown, stopCountdown }] =
    useCountdown({
      isIncrement: true,
      countStart: 0,
      countStop: Number.MAX_SAFE_INTEGER
    });

  const { startRecording, stopRecording } = useAudioRecorder({
    blobPropertyBag: {
      type: "audio/ogg"
    },
    onPermissionDenied: () => onPermissionDenied(),
    onStop: b => handleStopRecording(b),
    onStart: () => handleStartRecording()
  });

  const timerRef = useRef(timer);
  timerRef.current = timer;

  const getFormattedTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const remainingSeconds = Math.abs(Math.floor(minutes * 60 - time));

    return (
      minutes.toString().padStart(2, "0") +
      ":" +
      remainingSeconds.toString().padStart(2, "0")
    );
  };

  function handleStartRecording() {
    resetCountdown();
    startCountdown();
    setRecording(true);
  }

  async function handleStopRecording(b: string) {
    stopCountdown();
    setRecording(false);

    if (timerRef.current < MIN_LENGTH) {
      toast.error(
        "Gravação muito curta, o tempo mínimo é de " + MIN_LENGTH + " segundos"
      );
      return;
    }

    try {
      setLoading(true);

      const body = {
        audio: b,
        cpf: document,
        extension: "ogg",
        phone_number: phone,
        show_details: true
      };

      const suffix = enrollment ? "/v2.1/enrollment" : "/v2.1/authentication";

      const url = new URL(ROUTES_PREFIX + suffix);

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      }).then(r => r.json());

      const [type, message] = validateBiometricsResponse(resp.success, resp);

      if (type === "success") {
        toast.success(
          `${enrollment ? "Cadastro" : "Autenticação"} realizada com sucesso`
        );
        onSuccess();
        return;
      }

      const error = errors[message ?? "generic_error"];
      toast.error(error);
    } finally {
      setLoading(false);
    }
  }

  function onPermissionDenied() {
    stopCountdown();
    resetCountdown();
    setRecording(false);
    setShowRequestPermission(true);
  }

  if (showRequestPermission) {
    return (
      <>
        <DialogHeader>Permissão negada</DialogHeader>
        <div className="flex flex-col gap-2">
          <p>
            Para realizar o cadastro da voz é necessário permitir o acesso ao
            microfone.
          </p>
          <p>
            Para permitir o acesso, clique no ícone de cadeado na barra de
            endereço do navegador.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowRequestPermission(false)}
          >
            Tentar novamente
          </Button>
        </DialogFooter>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {enrollment ? "Cadastro da voz" : "Autenticação"}
        </DialogTitle>

        <DialogDescription>
          Clique no microfone, diga a frase de segurança e envie sua biometria
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col justify-center items-center gap-y-4">
        <h2>
          Realizar a autenticação utilizando somente a voz é simples, rápido e
          seguro.
        </h2>

        {getFormattedTime(timer)}

        <Button
          className="rounded-full"
          onClick={recording ? stopRecording : startRecording}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : recording ? (
            <PaperPlaneIcon />
          ) : (
            <Mic />
          )}
        </Button>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancelar</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}
