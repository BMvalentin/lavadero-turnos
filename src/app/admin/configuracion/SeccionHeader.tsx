export default function SeccionHeader({ titulo, descripcion }: { titulo: string; descripcion: string }) {
    return (
        <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{titulo}</h1>
            <p className="text-muted-foreground text-sm">{descripcion}</p>
        </div>
    );
}
