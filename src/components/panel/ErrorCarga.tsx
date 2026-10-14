export default function ErrorCarga({ mensaje }: { mensaje: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
      <p className="text-sm text-red-600">{mensaje}</p>
    </div>
  );
}
