const express = require('express');
const axios = require('axios');
const app = express();
const port = 5000;

// --- 🗝️ CONFIGURACIÓN V144 ORIGINAL (LA QUE NO FALLA) ---
const API_KEY = 'AIzaSyA7EekbKTyih7Sg9YG_-Ts_rKhw07IS244';
const MODELO_V141 = "gemini-3.1-flash-lite-preview"; 

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const INSTRUCCION_MAQUETADOR = `Actúa como el Escriba Supremo de Asgard. 
TU MISIÓN ES MAQUETAR TODO EL TEXTO QUE SE TE ENTREGUE DE UNA VEZ, SIN RESUMIR.
1. Mantén la numeración original (Ej: 1.6.1, 1.6.2, etc.).
2. Aplica la estructura de TENORES a cada sub-sección.
3. Formato: H1 para Títulos de Libros, H2 para Capítulos, H3 para Subtítulos.
NO hables con el usuario, solo entrega la OBRA MAQUETADA.`;

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><title>ASGARD V144 RESTAURADA</title></head>
    <body style="background:#020617; color:#f1f5f9; font-family:monospace; padding:50px; text-align:center;">
        <h1 style="color:#fbbf24; font-size: 2.8rem; margin-bottom:10px;">ASGARD V144</h1>
        <p style="color:#22d3ee; font-size:1.2rem;">SISTEMA ESTABLE - MODO RÁFAGA</p>
        <div style="display:flex; justify-content:center; gap:30px; margin-top:40px;">
            <div style="background:#0f172a; border:2px solid #fbbf24; padding:40px; border-radius:24px; width:450px;">
                <h3 style="color:#fbbf24;">ORÁCULO</h3>
                <form action="/generar" method="POST">
                    <input type="text" name="tema" style="width:90%; padding:15px; background:#1e293b; color:#fff; border:none; border-radius:10px; margin-bottom:20px;">
                    <button type="submit" style="background:#fbbf24; color:#020617; padding:15px 40px; border:none; border-radius:10px; cursor:pointer; font-weight:bold;">MANIFESTAR</button>
                </form>
            </div>
            <div style="background:#0f172a; border:2px solid #22d3ee; padding:40px; border-radius:24px; width:550px;">
                <h3 style="color:#22d3ee;">FRAGUA DE LIBROS (RÁFAGA)</h3>
                <form action="/maquetar" method="POST">
                    <textarea name="contenido" placeholder="PEGA AQUÍ TUS PÁGINAS..." style="width:95%; height:200px; padding:15px; background:#1e293b; color:#fff; border:none; border-radius:10px; font-family:monospace;"></textarea>
                    <br><br><button type="submit" style="background:#22d3ee; color:#020617; padding:15px 40px; border:none; border-radius:10px; cursor:pointer; font-weight:bold;">MAQUETAR TODO EL BLOQUE</button>
                </form>
            </div>
        </div>
    </body></html>`);
});

const invocarJaguar = async (prompt, intentos = 3) => {
    // URL CORREGIDA - ELIMINAMOS EL ERROR 404 USANDO EL FORMATO DE LA V144
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_V141}:generateContent?key=${API_KEY}`;
    try {
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 8192, temperature: 0.1 }
        }, { timeout: 300000 });
        return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
        if ((error.response?.status === 503 || error.response?.status === 429) && intentos > 0) {
            await new Promise(r => setTimeout(r, 6000));
            return invocarJaguar(prompt, intentos - 1);
        }
        throw error;
    }
};

app.post('/maquetar', async (req, res) => {
    try {
        const r = await invocarJaguar(`${INSTRUCCION_MAQUETADOR}\n\nCONTENIDO PARA MAQUETAR:\n${req.body.contenido}`);
        res.send(`
        <body style="background:#fdfdfd; color:#1a1a1a; font-family: 'Georgia', serif; padding:80px; line-height:1.8; text-align:justify;">
            <div style="max-width:750px; margin:auto; background:white; padding:80px; box-shadow:0 0 50px rgba(0,0,0,0.05); border-radius:8px;">
                <div style="white-space: pre-wrap; font-size:1.15rem;">${r}</div>
                <hr style="margin:50px 0; border:0; border-top:2px solid #e2e8f0;">
                <p style="text-align:center;">
                    <button onclick="window.print()" style="padding:15px 30px; cursor:pointer; background:#020617; color:white; border:none; border-radius:8px; font-weight:bold;">GUARDAR PDF (LIBRO)</button>
                    <br><br><a href="/" style="color:#64748b; text-decoration:none;">← VOLVER</a>
                </p>
            </div>
        </body>`);
    } catch (e) { res.status(500).send("ERROR DE CONEXIÓN: " + e.message); }
});

app.post('/generar', async (req, res) => {
    try {
        const r = await invocarJaguar(`Gnosis: ${req.body.tema}`);
        res.send(`<body style="background:#020617; color:#f1f5f9; font-family:monospace; padding:50px;"><div style="white-space:pre-wrap; background:#0f172a; padding:30px; border-left:4px solid #fbbf24; border-radius:15px;">${r}</div><br><a href="/" style="color:#fbbf24;">VOLVER</a></body>`);
    } catch (e) { res.status(500).send("ERROR: " + e.message); }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`\n🚀 ASGARD V144 RESTAURADA: MOTOR LISTO`);
});
