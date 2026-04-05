export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">404</p>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">
          Página não encontrada
        </h1>
        <p className="text-on-surface-variant">
          O conteúdo que você tentou acessar não existe ou foi movido.
        </p>
      </div>
    </main>
  );
}
