import ConfigSidebar from "./ConfigSidebar";

export const metadata = {
    title: "Configuración",
};

export default function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="mt-16 flex flex-col md:flex-row flex-1 min-h-[calc(100vh-4rem)] bg-celeste/5">
            <ConfigSidebar />
            <div className="flex-1 min-w-0 p-4 md:p-8 lg:p-10">
                <div className="mx-auto w-full max-w-6xl">{children}</div>
            </div>
        </div>
    );
}
