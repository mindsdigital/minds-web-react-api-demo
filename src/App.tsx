import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import AuthenticationDialog from "./components/authentication-dialog";
import { Toaster } from "./components/ui/sonner";
import usePersistantState from "./hooks/usePersistantState";
import { jwtDecode } from "jwt-decode";

interface TokenData {
  company_id: number;
}

function App() {
  const [token, setToken] = usePersistantState("api_token", "");
  const [open, setOpen] = useState(false);

  function handleTokenSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setOpen(true);
  }

  return (
    <div className="w-full h-full flex justify-center items-center">
      <Toaster />

      <Card>
        <CardHeader>
          <CardTitle>Autenticação e cadastro de voz</CardTitle>
        </CardHeader>

        <form onSubmit={handleTokenSubmit}>
          <CardContent className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="token">Token</Label>
              <Input
                id="token"
                value={token}
                onChange={e => setToken(e.target.value)}
                required
              />
            </div>

            {token ? (
              <div className="flex flex-col gap-2">
                <Label>Empresa</Label>
                {jwtDecode<TokenData>(token).company_id}
              </div>
            ) : null}

            <Button>Realizar autenticação/cadastro</Button>
          </CardContent>
        </form>
      </Card>

      <AuthenticationDialog open={open} onOpenChange={setOpen} token={token} />
    </div>
  );
}

export default App;
