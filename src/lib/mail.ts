import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'Tu Lavadero <no-reply@tulavadero.com>';

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true para port 465, false para otros
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

export interface TurnoDetails {
    cliente: string;
    fecha: string; // Formateada previamente a local
    servicio: string;
    vehiculo: string;
    precio?: number;
    senia?: number;
}

const getBaseEmailTemplate = (titulo: string, mensaje: string, detallesHtml: string, colorBorder: string = '#2563eb') => {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${titulo}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #09090b; font-family: 'Inter', Helvetica, Arial, sans-serif; color: #ffffff;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181b; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); border-top: 4px solid ${colorBorder}; overflow: hidden;">
                        <tr>
                            <td align="center" style="padding: 40px 20px 20px 20px;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                                    TU LAVADERO
                                </h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 40px;">
                                <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                                    ${mensaje}
                                </p>
                                
                                <div style="background-color: rgba(0, 0, 0, 0.4); border-radius: 12px; padding: 24px; border: 1px solid rgba(255, 255, 255, 0.05);">
                                    <h3 style="color: #60a5fa; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
                                        Detalles del Turno
                                    </h3>
                                    ${detallesHtml}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="padding: 30px 40px 40px 40px;">
                                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                                    Este es un correo autogenerado, por favor no respondas a este mensaje.
                                </p>
                                <p style="color: #6b7280; font-size: 12px; margin-top: 8px;">
                                    &copy; ${new Date().getFullYear()} Tu Lavadero. Todos los derechos reservados.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

const getDetallesHtml = (detalles: TurnoDetails) => {
    return `
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                    <strong style="color: #ffffff; font-size: 14px;">Cliente:</strong>
                </td>
                <td align="right" style="padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                    <span style="color: #d1d5db; font-size: 14px;">${detalles.cliente}</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                    <strong style="color: #ffffff; font-size: 14px;">Fecha y Hora:</strong>
                </td>
                <td align="right" style="padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                    <span style="color: #d1d5db; font-size: 14px;">${detalles.fecha}</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                    <strong style="color: #ffffff; font-size: 14px;">Vehículo:</strong>
                </td>
                <td align="right" style="padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                    <span style="color: #d1d5db; font-size: 14px;">${detalles.vehiculo}</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0; ${detalles.precio ? 'border-bottom: 1px solid rgba(255, 255, 255, 0.05);' : ''}">
                    <strong style="color: #ffffff; font-size: 14px;">Servicio:</strong>
                </td>
                <td align="right" style="padding: 8px 0; ${detalles.precio ? 'border-bottom: 1px solid rgba(255, 255, 255, 0.05);' : ''}">
                    <span style="color: #d1d5db; font-size: 14px;">${detalles.servicio}</span>
                </td>
            </tr>
            ${detalles.precio ? `
            <tr>
                <td style="padding: 8px 0;">
                    <strong style="color: #ffffff; font-size: 14px;">Precio estimado:</strong>
                </td>
                <td align="right" style="padding: 8px 0;">
                    <span style="color: #60a5fa; font-size: 14px; font-weight: bold;">$${detalles.precio}</span>
                </td>
            </tr>
            ` : ''}
        </table>
    `;
};

export const enviarCorreoCreacionTurno = async (emailTo: string, detalles: TurnoDetails) => {
    try {
        const titulo = "Turno Confirmado";
        const mensaje = `Hola <strong>${detalles.cliente}</strong>, tu turno ha sido reservado con éxito. A continuación, te compartimos los detalles de tu reserva.`;
        const detallesHtml = getDetallesHtml(detalles);
        const htmlBody = getBaseEmailTemplate(titulo, mensaje, detallesHtml, '#22c55e'); // border-green-500

        await transporter.sendMail({
            from: SMTP_FROM_EMAIL,
            to: emailTo,
            subject: "Tu turno ha sido reservado - Tu Lavadero",
            html: htmlBody,
        });
        console.log(`Correo de creación enviado a ${emailTo}`);
    } catch (error) {
        console.error("Error enviando correo de creación:", error);
    }
};

export const enviarCorreoModificacionTurno = async (emailTo: string, detalles: TurnoDetails) => {
    try {
        const titulo = "Turno Modificado";
        const mensaje = `Hola <strong>${detalles.cliente}</strong>, te informamos que tu turno ha sido modificado. Aquí tienes los datos actualizados de tu reserva.`;
        const detallesHtml = getDetallesHtml(detalles);
        const htmlBody = getBaseEmailTemplate(titulo, mensaje, detallesHtml, '#3b82f6'); // border-blue-500

        await transporter.sendMail({
            from: SMTP_FROM_EMAIL,
            to: emailTo,
            subject: "Tu turno ha sido modificado - Tu Lavadero",
            html: htmlBody,
        });
        console.log(`Correo de modificación enviado a ${emailTo}`);
    } catch (error) {
        console.error("Error enviando correo de modificación:", error);
    }
};

export const enviarCorreoCancelacionTurno = async (emailTo: string, detalles: TurnoDetails) => {
    try {
        const titulo = "Turno Cancelado";
        const mensaje = `Hola <strong>${detalles.cliente}</strong>, lamentamos informarte que tu turno ha sido cancelado. Esperamos verte pronto de nuevo por aquí.`;
        const detallesHtml = getDetallesHtml(detalles);
        const htmlBody = getBaseEmailTemplate(titulo, mensaje, detallesHtml, '#ef4444'); // border-red-500

        await transporter.sendMail({
            from: SMTP_FROM_EMAIL,
            to: emailTo,
            subject: "Tu turno ha sido cancelado - Tu Lavadero",
            html: htmlBody,
        });
        console.log(`Correo de cancelación enviado a ${emailTo}`);
    } catch (error) {
        console.error("Error enviando correo de cancelación:", error);
    }
};
