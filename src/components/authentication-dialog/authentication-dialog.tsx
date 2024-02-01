import { useState } from "react";
import VerifyStep from "./verify-step";
import { Dialog, DialogContent } from "../ui/dialog";
import RecordStep from "./record-step";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
}

export default function AuthenticationDialog({
  open,
  onOpenChange,
  token
}: Props) {
  const [step, setStep] = useState(0);
  const [doc, setDoc] = useState("");
  const [phone, setPhone] = useState("");

  function handleVerify(doc: string, phone: string, enrolled: boolean) {
    setDoc(doc);
    setPhone(phone);
    setStep(enrolled ? 2 : 1);
  }

  function handleOpenChange(state: boolean) {
    onOpenChange(state);
    setStep(0);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {step === 0 ? (
          <VerifyStep
            onOpenChange={handleOpenChange}
            token={token}
            onSuccess={handleVerify}
            key="verify"
          />
        ) : null}

        {step === 1 ? (
          <RecordStep
            enrollment
            onSuccess={() => setStep(2)}
            token={token}
            key="enrollment"
            document={doc}
            phone={phone}
          />
        ) : null}

        {step === 2 ? (
          <RecordStep
            onSuccess={() => setStep(2)}
            token={token}
            key="authentication"
            document={doc}
            phone={phone}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
