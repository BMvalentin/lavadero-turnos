// Rate limit en memoria con ventana fija. Corre dentro del middleware (Edge),
// así que no usa APIs de Node. Los contadores viven en el proceso del servidor:
// sirve para una sola instancia (`next start`); con varias instancias cada una
// cuenta por separado.

type Ventana = { cantidad: number; reinicio: number };

const ventanas = new Map<string, Ventana>();
let proximaLimpieza = 0;

// Saca las ventanas vencidas de vez en cuando para que el Map no crezca sin fin.
function limpiar(ahora: number) {
    if (ahora < proximaLimpieza) return;
    proximaLimpieza = ahora + 60_000;
    for (const [clave, v] of ventanas) {
        if (v.reinicio <= ahora) ventanas.delete(clave);
    }
}

export type ResultadoLimite = { permitido: boolean; reintentarEnSeg: number };

export function consumir(clave: string, limite: number, ventanaMs: number): ResultadoLimite {
    const ahora = Date.now();
    limpiar(ahora);

    let v = ventanas.get(clave);
    if (!v || v.reinicio <= ahora) {
        v = { cantidad: 0, reinicio: ahora + ventanaMs };
        ventanas.set(clave, v);
    }

    v.cantidad++;
    return {
        permitido: v.cantidad <= limite,
        reintentarEnSeg: Math.ceil((v.reinicio - ahora) / 1000),
    };
}
