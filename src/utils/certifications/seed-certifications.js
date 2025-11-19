import fs from 'fs/promises';
import fetch from 'node-fetch';
// Troque a linha problemática por esta:
import { BASE_URL } from '../seed.config.js'; // Ajuste o caminho para a pasta src/utils/

// Determina o ambiente e pega a URL base
const ENV = process.env.NODE_ENV || 'development';

// Constrói as URLs usando a variável BASE_URL
const API_URL = `${BASE_URL}/certifications`;
const LOGIN_URL = `${BASE_URL}/auth/login`;

const USER_CPF = "000.000.000-00";
const USER_PASSWORD = "Senha@123";

async function main() {
    console.log(`📡 Conectando a: ${BASE_URL} (Ambiente: ${ENV})`);
    
    try {
        const loginRes = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf: USER_CPF, password: USER_PASSWORD })
        });

        // Verificação se o login foi OK
        if (!loginRes.ok) {
            const err = await loginRes.json();
            throw new Error(`Falha no login: ${err.message || 'Erro desconhecido.'}`);
        }

        const { access_token } = await loginRes.json();

        console.log("✅ Token obtido");

        // O resto do seu código de leitura e inserção...
        const file = await fs.readFile('./src/utils/certifications/certifications-data.json', 'utf-8');
        const certifications = JSON.parse(file);

        for (const cert of certifications) {
            const existsRes = await fetch(`${API_URL}?name=${encodeURIComponent(cert.name)}`);
            const exists = await existsRes.json();

            if (exists.length > 0) {
                console.log(`⚠️ Já existe: ${cert.name}`);
                continue;
            }

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
                body: JSON.stringify(cert)
            });

            if (!res.ok) {
                const err = await res.json();
                console.error(`❌ Erro ao inserir ${cert.name}:`, err);
            } else {
                console.log(`✅ Inserido: ${cert.name}`);
            }
        }
    } catch (error) {
        console.error('💥 Falha no seed, erro na leitura do arquivo:', error.message || error);
    }
}

main();