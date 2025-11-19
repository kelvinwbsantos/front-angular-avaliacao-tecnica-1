import fetch from 'node-fetch';
import fs from 'fs/promises';
import { BASE_URL } from '../seed.config.js'; // Ajuste o caminho conforme a localização real

const API_URL = `${BASE_URL}/auth/registerWithoutInvitation`;

async function main() {
  try {
    console.log('🏁 Iniciando seed de usuários...');

    // Lê o arquivo JSON com os usuários
    const fileContent = await fs.readFile('./src/utils/users/users-data.json', 'utf-8');
    const users = JSON.parse(fileContent);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });

        if (res.ok) {
          console.log(`✅ Usuário criado: ${user.name} (${user.email})`);
          successCount++;
        } else {
          const error = await res.text();
          console.log(`❌ Erro no usuário ${user.name}:`, error);
          errorCount++;
        }

        // Pequena pausa para não sobrecarregar o servidor
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`💥 Falha ao criar ${user.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Relatório Final:');
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📋 Total processado: ${users.length}`);

  } catch (error) {
    console.error('💥 Erro ao ler arquivo de dados:', error);
  }
}

main();