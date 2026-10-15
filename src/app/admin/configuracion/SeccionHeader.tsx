import EncabezadoPagina from "@/components/panel/EncabezadoPagina";

export default function SeccionHeader({ titulo, descripcion }: { titulo: string; descripcion: string }) {
    return <EncabezadoPagina titulo={titulo} descripcion={descripcion} />;
}
