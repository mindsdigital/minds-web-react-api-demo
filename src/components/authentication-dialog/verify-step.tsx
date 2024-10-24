import { ROUTES_PREFIX } from "@/lib/config";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  DialogHeader,
  DialogFooter,
  DialogClose,
  DialogTitle
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface Response {
  success: boolean;
  error: {
    code: string;
  };
  enrolled: boolean;
}

const mascaraTelefone = (valor: string) => {
  valor = valor.replace(/\D/g, "");
  valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
  valor = valor.replace(/(\d)(\d{4})$/, "$1-$2");
  return valor;
};

function clearMask(value?: string) {
  return value ? value.replace(/[^0-9]/g, "") : "";
}

interface Props {
  token: string;
  onOpenChange: (open: boolean) => void;
  onSuccess: (doc: string, phone: string, enrolled: boolean) => void;
}

export default function VerifyStep({ token, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    debugger;
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const doc = clearMask(formData.get("document")?.toString() ?? "");
    const phone = clearMask(formData.get("phone")?.toString() ?? "");

    const url = ROUTES_PREFIX +  "/v2.1/enrollment/verify?document_value=" + doc 
    try {
      setLoading(true);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Access-Control-Allow-Origin":"*"
        }
      });

      if (response.status === 401) {
        toast.error("Token inválido");
        onOpenChange(false);
        return;
      }

      const data = (await response.json()) as Response;

      if (!data.success) {
        toast.error(
          "Ocorreu um erro ao tentar verificar o documento. Código " +
            data.error.code
        );
        return;
      }

      if (data.enrolled) {
        toast.success("Cliente já cadastrado");
      }

      onSuccess(doc, phone, data.enrolled);
    } catch {
      toast.error("Ocorreu um erro ao tentar verificar o documento");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Dados do cliente</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="document">Documento</Label>
          <Input id="document" name="document" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            required
            minLength={14}
            maxLength={15}
            onChange={e => {
              e.target.value = mascaraTelefone(e.target.value);
            }}
          />
        </div>

        <DialogFooter>
          <Button type="submit">
            {loading ? <Loader2 className="animate-spin" /> : "Continuar"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </>
  );
}
