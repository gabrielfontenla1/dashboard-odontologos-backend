const { Resend } = require('resend');
const QRCode = require('qrcode');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender configuration
const defaultSender = {
    email: 'info@gabrielfontenla.com',
    name: 'Sistema de Turnos'
};

// Función para generar código QR
const generateQRCode = async (appointmentData) => {
    try {
        // Crear la data que contendrá el QR
        const qrData = {
            appointmentId: appointmentData.appointment._id || appointmentData.appointment.id,
            patientName: appointmentData.patient.name,
            doctorName: appointmentData.doctor.name,
            serviceName: appointmentData.service.name,
            date: appointmentData.appointment.date,
            duration: appointmentData.appointment.duration,
            checkInUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkin/${appointmentData.appointment._id || appointmentData.appointment.id}`,
            timestamp: new Date().toISOString()
        };

        // Generar el código QR como base64
        const qrCodeBase64 = await QRCode.toDataURL(JSON.stringify(qrData), {
            width: 200,
            margin: 2,
            color: {
                dark: '#1e40af', // Color azul para el QR
                light: '#ffffff'  // Fondo blanco
            }
        });

        return qrCodeBase64;
    } catch (error) {
        console.error('Error generating QR code:', error);
        return null;
    }
};

// Email templates
const emailTemplates = {
    appointmentConfirmation: async (appointment, patient, doctor, service) => {
        // Generar código QR
        const qrCode = await generateQRCode({ appointment, patient, doctor, service });
        
        return {
            subject: "Tu turno ha sido confirmado",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1e40af; font-size: 24px; margin-bottom: 10px;">Tu Turno ha sido Confirmado</h1>
                        <p style="color: #4b5563;">¡Esperamos verte pronto!</p>
                    </div>

                    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                        <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Detalles del Turno</h2>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                            <div>
                                <p style="color: #6b7280; margin: 0;">Paciente</p>
                                <p style="color: #1f2937; font-weight: 500; margin: 5px 0;">${patient.name}</p>
                            </div>
                            <div>
                                <p style="color: #6b7280; margin: 0;">Doctor</p>
                                <p style="color: #1f2937; font-weight: 500; margin: 5px 0;">${doctor.name}</p>
                            </div>
                            <div>
                                <p style="color: #6b7280; margin: 0;">Fecha</p>
                                <p style="color: #1f2937; font-weight: 500; margin: 5px 0;">${new Date(appointment.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div>
                                <p style="color: #6b7280; margin: 0;">Hora</p>
                                <p style="color: #1f2937; font-weight: 500; margin: 5px 0;">${new Date(appointment.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div>
                                <p style="color: #6b7280; margin: 0;">Servicio</p>
                                <p style="color: #1f2937; font-weight: 500; margin: 5px 0;">${service.name}</p>
                            </div>
                            <div>
                                <p style="color: #6b7280; margin: 0;">Duración</p>
                                <p style="color: #1f2937; font-weight: 500; margin: 5px 0;">${appointment.duration} minutos</p>
                            </div>
                        </div>
                    </div>

                    ${qrCode ? `
                    <div style="background-color: #f0f9ff; border: 2px dashed #0ea5e9; border-radius: 12px; padding: 30px; margin-bottom: 30px; text-align: center;">
                        <h2 style="color: #0ea5e9; font-size: 18px; margin-bottom: 15px;">📱 Check-in Rápido</h2>
                        <p style="color: #075985; font-size: 14px; margin-bottom: 20px;">
                            Muestra este código QR a la secretaria cuando llegues para un check-in instantáneo
                        </p>
                        <div style="background-color: white; padding: 20px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <img src="${qrCode}" alt="Código QR para Check-in" style="display: block; margin: 0 auto;">
                        </div>
                        <p style="color: #075985; font-size: 12px; margin-top: 15px; font-style: italic;">
                            💡 Solo escanea cuando llegues a la clínica
                        </p>
                    </div>
                    ` : ''}

                    <div style="margin-bottom: 30px;">
                        <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Instrucciones de Preparación</h2>
                        <ul style="color: #4b5563; font-size: 14px; padding-left: 20px; margin: 0;">
                            <li style="margin-bottom: 8px;">Por favor, llegue 15 minutos antes de su turno</li>
                            <li style="margin-bottom: 8px;">Traiga su documento de identidad</li>
                            <li style="margin-bottom: 8px;">Muestre el código QR arriba para check-in rápido</li>
                            <li style="margin-bottom: 8px;">Traiga su historia clínica si es la primera vez</li>
                            <li style="margin-bottom: 8px;">Complete cualquier formulario previo que le hayamos enviado</li>
                        </ul>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <div style="display: flex; flex-direction: column; gap: 12px; align-items: center;">
                            <a href="#" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: block; width: 200px; max-width: 100%; text-align: center; box-sizing: border-box;">Agregar al Calendario</a>
                            <a href="#" style="border: 1px solid #2563eb; color: #2563eb; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: block; width: 200px; max-width: 100%; text-align: center; box-sizing: border-box;">Reprogramar</a>
                            <a href="#" style="border: 1px solid #dc2626; color: #dc2626; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: block; width: 200px; max-width: 100%; text-align: center; box-sizing: border-box;">Cancelar Cita</a>
                        </div>
                    </div>

                    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                        <p>Si necesita cancelar o reprogramar, por favor hágalo con al menos 24 horas de anticipación.</p>
                        <p style="margin-top: 10px;">© ${new Date().getFullYear()} Clínica Odontológica. Todos los derechos reservados.</p>
                    </div>
                </div>
            `
        };
    },

    appointmentReminder: async (appointment, patient, doctor, service) => {
        // Generar código QR
        const qrCode = await generateQRCode({ appointment, patient, doctor, service });
        
        return {
            subject: "Recordatorio: Tu turno es mañana",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1e40af; font-size: 24px; margin-bottom: 10px;">Recordatorio de Turno</h1>
                        <p style="color: #4b5563;">Tu turno está programado para mañana</p>
                    </div>

                    <div style="background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin-bottom: 30px; text-align: center;">
                        <div style="color: #92400e; font-weight: bold; font-size: 18px; margin-bottom: 5px;">24 Horas Restantes</div>
                        <p style="color: #92400e; font-size: 14px;">Tu turno está programado para mañana</p>
                    </div>

                    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                        <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Detalles del Turno</h2>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                            <div>
                                <p style="color: #6b7280; margin: 0;">Paciente</p>
                                <p style="color: #1f2937; font-weight: 500; margin: 5px 0;">${patient.name}</p>
                            </div>
                            <div>
                                <p style="color: #6b7280; margin: 0;">Doctor</p>
                                <p style="color: #1f2937; font-weight: 500; margin: 5px 0;">${doctor.name}</p>
                            </div>
                            <div>
                                <p style="color: #6b7280; margin: 0;">Fecha</p>
                                <p style="color: #1f2937; font-weight: 500; margin: 5px 0;">${new Date(appointment.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div>
                                <p style="color: #6b7280; margin: 0;">Hora</p>
                                <p style="color: #1f2937; font-weight: 500; margin: 5px 0;">${new Date(appointment.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div>
                                <p style="color: #6b7280; margin: 0;">Servicio</p>
                                <p style="color: #1f2937; font-weight: 500; margin: 5px 0;">${service.name}</p>
                            </div>
                        </div>
                    </div>

                    ${qrCode ? `
                    <div style="background-color: #f0f9ff; border: 2px dashed #0ea5e9; border-radius: 12px; padding: 30px; margin-bottom: 30px; text-align: center;">
                        <h2 style="color: #0ea5e9; font-size: 18px; margin-bottom: 15px;">📱 Check-in Rápido</h2>
                        <p style="color: #075985; font-size: 14px; margin-bottom: 20px;">
                            Tendrás este código QR listo para mostrar a la secretaria cuando llegues
                        </p>
                        <div style="background-color: white; padding: 20px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <img src="${qrCode}" alt="Código QR para Check-in" style="display: block; margin: 0 auto;">
                        </div>
                        <p style="color: #075985; font-size: 12px; margin-top: 15px; font-style: italic;">
                            💡 Guarda este email para tenerlo disponible mañana
                        </p>
                    </div>
                    ` : ''}

                    <div style="margin-bottom: 30px;">
                        <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Lista de Verificación Previa</h2>
                        <div style="font-size: 14px; color: #4b5563;">
                            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                <input type="checkbox" style="margin-right: 10px;"> Traer documento de identidad
                            </div>
                            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                <input type="checkbox" style="margin-right: 10px;"> Tener el código QR listo en el teléfono
                            </div>
                            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                <input type="checkbox" style="margin-right: 10px;"> Traer historia clínica si es primera vez
                            </div>
                            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                <input type="checkbox" style="margin-right: 10px;"> Completar formularios previos
                            </div>
                            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                <input type="checkbox" style="margin-right: 10px;"> Llegar 15 minutos antes
                            </div>
                        </div>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <div style="display: flex; flex-direction: column; gap: 12px; align-items: center;">
                            <a href="#" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: block; width: 200px; max-width: 100%; text-align: center; box-sizing: border-box;">Confirmar Asistencia</a>
                            <a href="#" style="border: 1px solid #2563eb; color: #2563eb; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: block; width: 200px; max-width: 100%; text-align: center; box-sizing: border-box;">Reprogramar</a>
                            <a href="#" style="border: 1px solid #dc2626; color: #dc2626; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: block; width: 200px; max-width: 100%; text-align: center; box-sizing: border-box;">Cancelar</a>
                        </div>
                    </div>

                    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                        <p>Si necesita cancelar o reprogramar, por favor hágalo con al menos 24 horas de anticipación.</p>
                        <p style="margin-top: 10px;">© ${new Date().getFullYear()} Clínica Odontológica. Todos los derechos reservados.</p>
                    </div>
                </div>
            `
        };
    },

    appointmentCancellation: (appointment, patient, doctor, service) => ({
        subject: "Tu turno ha sido cancelado",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #374151; font-size: 24px; margin-bottom: 10px;">Tu Turno ha sido Cancelado</h1>
                    <p style="color: #4b5563;">Hemos recibido tu solicitud de cancelación</p>
                </div>

                <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h2 style="color: #374151; font-size: 18px; margin-bottom: 15px;">Detalles del Turno Cancelado</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                        <div>
                            <p style="color: #6b7280; margin: 0;">Paciente</p>
                            <p style="color: #1f2937; font-weight: 500; margin: 5px 0;">${patient.name}</p>
                        </div>
                        <div>
                            <p style="color: #6b7280; margin: 0;">Doctor</p>
                            <p style="color: #1f2937; font-weight: 500; margin: 5px 0;">${doctor.name}</p>
                        </div>
                        <div>
                            <p style="color: #6b7280; margin: 0;">Fecha</p>
                            <p style="color: #1f2937; font-weight: 500; margin: 5px 0;">${new Date(appointment.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div>
                            <p style="color: #6b7280; margin: 0;">Hora</p>
                            <p style="color: #1f2937; font-weight: 500; margin: 5px 0;">${new Date(appointment.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div>
                            <p style="color: #6b7280; margin: 0;">Servicio</p>
                            <p style="color: #1f2937; font-weight: 500; margin: 5px 0;">${service.name}</p>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 30px;">
                    <h2 style="color: #374151; font-size: 18px; margin-bottom: 15px;">¿Te gustaría reprogramar?</h2>
                    <p style="color: #4b5563; font-size: 14px; margin-bottom: 15px;">Si deseas reprogramar tu turno, aquí hay algunos horarios disponibles:</p>
                    <div style="display: grid; gap: 10px;">
                        <a href="#" style="border: 1px solid #e5e7eb; padding: 12px; text-decoration: none; border-radius: 6px; color: #1f2937; display: flex; justify-content: space-between;">
                            Lunes, 10 de Junio <span>9:00 AM</span>
                        </a>
                        <a href="#" style="border: 1px solid #e5e7eb; padding: 12px; text-decoration: none; border-radius: 6px; color: #1f2937; display: flex; justify-content: space-between;">
                            Martes, 11 de Junio <span>11:30 AM</span>
                        </a>
                        <a href="#" style="border: 1px solid #e5e7eb; padding: 12px; text-decoration: none; border-radius: 6px; color: #1f2937; display: flex; justify-content: space-between;">
                            Miércoles, 12 de Junio <span>1:45 PM</span>
                        </a>
                    </div>
                </div>

                <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 15px;">Opción de Telemedicina</h2>
                    <p style="color: #4b5563; font-size: 14px; margin-bottom: 15px;">¿No puedes venir a la clínica? Considera una consulta por telemedicina.</p>
                    <a href="#" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: block; text-align: center;">Agendar Consulta por Telemedicina</a>
                </div>

                <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                    <p>Nuestra política de cancelación: Los turnos cancelados con menos de 24 horas de anticipación pueden incurrir en un cargo.</p>
                    <p style="margin-top: 10px;">© ${new Date().getFullYear()} Clínica Odontológica. Todos los derechos reservados.</p>
                </div>
            </div>
        `
    }),

    appointmentReschedule: (appointment, patient, doctor, service) => ({
        subject: "Tu turno ha sido reprogramado",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #6b21a8; font-size: 24px; margin-bottom: 10px;">Tu Turno ha sido Reprogramado</h1>
                    <p style="color: #4b5563;">Nos disculpamos por cualquier inconveniente</p>
                </div>

                <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h2 style="color: #6b21a8; font-size: 18px; margin-bottom: 15px;">Cambios en el Turno</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div style="background-color: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
                            <div style="color: #dc2626; font-weight: 500; margin-bottom: 5px;">Turno Original</div>
                            <p style="color: #4b5563; margin: 5px 0;">${new Date(appointment.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p style="color: #4b5563; margin: 5px 0;">${new Date(appointment.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                            <p style="color: #4b5563; margin: 5px 0;">${doctor.name}</p>
                        </div>
                        <div style="background-color: white; padding: 15px; border-radius: 6px; border: 1px solid #86efac;">
                            <div style="color: #16a34a; font-weight: 500; margin-bottom: 5px;">Nuevo Turno</div>
                            <p style="color: #4b5563; margin: 5px 0;">${new Date(appointment.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p style="color: #4b5563; margin: 5px 0;">${new Date(appointment.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                            <p style="color: #4b5563; margin: 5px 0;">${doctor.name}</p>
                        </div>
                    </div>
                </div>

                <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                    <h2 style="color: #374151; font-size: 18px; margin-bottom: 15px;">Razón de la Reprogramación</h2>
                    <p style="color: #4b5563; font-size: 14px;">
                        Hemos tenido que reprogramar tu turno debido a un cambio inesperado en la agenda del doctor. Nos disculpamos por cualquier inconveniente que esto pueda causar.
                    </p>
                </div>

                <div style="margin-bottom: 30px;">
                    <h2 style="color: #6b21a8; font-size: 18px; margin-bottom: 15px;">¿Necesitas otro horario?</h2>
                    <p style="color: #4b5563; font-size: 14px; margin-bottom: 15px;">
                        Si el nuevo horario no te funciona, por favor selecciona entre las opciones disponibles:
                    </p>
                    <div style="display: grid; gap: 10px;">
                        <a href="#" style="border: 1px solid #e5e7eb; padding: 12px; text-decoration: none; border-radius: 6px; color: #1f2937; display: flex; justify-content: space-between;">
                            Jueves, 6 de Junio <span>9:00 AM</span>
                        </a>
                        <a href="#" style="border: 1px solid #e5e7eb; padding: 12px; text-decoration: none; border-radius: 6px; color: #1f2937; display: flex; justify-content: space-between;">
                            Jueves, 6 de Junio <span>11:30 AM</span>
                        </a>
                        <a href="#" style="border: 1px solid #e5e7eb; padding: 12px; text-decoration: none; border-radius: 6px; color: #1f2937; display: flex; justify-content: space-between;">
                            Viernes, 7 de Junio <span>1:45 PM</span>
                        </a>
                    </div>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <div style="display: flex; flex-direction: column; gap: 12px; align-items: center;">
                        <a href="#" style="background-color: #6b21a8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: block; width: 200px; max-width: 100%; text-align: center; box-sizing: border-box;">Confirmar Nuevo Horario</a>
                        <a href="#" style="border: 1px solid #6b21a8; color: #6b21a8; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: block; width: 200px; max-width: 100%; text-align: center; box-sizing: border-box;">Llamar a la Clínica</a>
                    </div>
                </div>

                <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
                    <p>Valoramos tu tiempo y nos disculpamos por cualquier inconveniente.</p>
                    <p style="margin-top: 10px;">© ${new Date().getFullYear()} Clínica Odontológica. Todos los derechos reservados.</p>
                </div>
            </div>
        `
    })
};

class EmailService {
    static async sendEmail(to, template, data) {
        try {
            if (!process.env.RESEND_API_KEY) {
                console.error('Resend API key not configured');
                return false;
            }

            // Ahora manejamos templates async
            const emailTemplate = await emailTemplates[template](...data);
            
            const { data: response, error } = await resend.emails.send({
                from: `${defaultSender.name} <${defaultSender.email}>`,
                to: [to.email],
                subject: emailTemplate.subject,
                html: emailTemplate.html
            });

            if (error) {
                console.error('Error sending email:', error);
                return false;
            }

            console.log('✅ Email sent successfully:', response);
            return true;
        } catch (error) {
            console.error('❌ Error sending email:', error);
            return false;
        }
    }

    // Convenience methods for different types of emails
    static async sendAppointmentConfirmation(appointment, patient, doctor, service) {
        console.log('📧 Sending confirmation email with QR code to:', patient.email);
        return this.sendEmail(
            { email: patient.email, name: patient.name },
            'appointmentConfirmation',
            [appointment, patient, doctor, service]
        );
    }

    static async sendAppointmentReminder(appointment, patient, doctor, service) {
        console.log('📧 Sending reminder email with QR code to:', patient.email);
        return this.sendEmail(
            { email: patient.email, name: patient.name },
            'appointmentReminder',
            [appointment, patient, doctor, service]
        );
    }

    static async sendAppointmentCancellation(appointment, patient, doctor, service) {
        console.log('📧 Sending cancellation email to:', patient.email);
        return this.sendEmail(
            { email: patient.email, name: patient.name },
            'appointmentCancellation',
            [appointment, patient, doctor, service]
        );
    }

    static async sendAppointmentReschedule(appointment, patient, doctor, service) {
        console.log('📧 Sending reschedule email to:', patient.email);
        return this.sendEmail(
            { email: patient.email, name: patient.name },
            'appointmentReschedule',
            [appointment, patient, doctor, service]
        );
    }

    // Método para generar QR independiente (para uso en dashboard)
    static async generateQRCode(appointmentData) {
        return generateQRCode(appointmentData);
    }
}

module.exports = EmailService; 