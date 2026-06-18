import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="flex items-center justify-between border-b bg-background px-6 py-4">
        <h1 className="text-lg font-semibold">AGD Warehouse</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Wyloguj
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Witaj 👋</CardTitle>
            <CardDescription>
              Jesteś zalogowany. To jest chroniony pulpit — tutaj dobudujemy
              moduł magazynu AGD.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Połączenie z Supabase działa, autentykacja działa. Daj znać co
              dodać dalej (np. tabelę produktów, stany magazynowe, role).
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
