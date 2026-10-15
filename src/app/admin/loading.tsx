export default function CargandoPanelAdministrativo() {
  return (
    <div className="animate-pulse space-y-8" aria-label="Cargando panel administrativo" aria-busy="true">
      <div className="space-y-3">
        <div className="h-8 w-64 rounded-lg bg-[var(--admin-border)]" />
        <div className="h-4 w-80 max-w-full rounded bg-[var(--admin-border)]" />
      </div>
      <div className="h-14 rounded-2xl bg-[var(--admin-border)]" />
      <div className="h-96 rounded-2xl bg-[var(--admin-border)]" />
    </div>
  );
}
