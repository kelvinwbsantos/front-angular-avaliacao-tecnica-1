// src/utils/seed.config.js

// Define as URLs para cada ambiente
const config = {
    // Usado se você rodar "node script.js"
    development: {
        API_BASE_URL: 'http://localhost:3000',
    },
    // Usado se você rodar "NODE_ENV=production node script.js"
    production: {
        API_BASE_URL: 'https://mas.tiweb.app.br/api', // Substitua pela URL REAL do seu backend
    }
};

// Determina o ambiente atual (padrão é 'development')
const env = process.env.NODE_ENV || 'development';

export const BASE_URL = config[env].API_BASE_URL;