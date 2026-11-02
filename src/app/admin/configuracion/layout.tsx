export const metadata = {
    title: "Configuración",
};

// La navegación entre secciones está en el desplegable "Configuración" del sidebar.
export default function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
    return <div className="mx-auto w-full max-w-6xl">{children}</div>;
}
