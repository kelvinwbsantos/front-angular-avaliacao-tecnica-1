// generate-users-data.js
import fs from 'fs/promises';

// Função para gerar CPF válido (já existente)
function generateCPF() {
  const randomDigit = () => Math.floor(Math.random() * 9);

  let cpf = '';
  for (let i = 0; i < 9; i++) {
    cpf += randomDigit();
  }

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let firstDigit = (sum * 10) % 11;
  if (firstDigit >= 10) firstDigit = 0;
  cpf += firstDigit;

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  let secondDigit = (sum * 10) % 11;
  if (secondDigit >= 10) secondDigit = 0;
  cpf += secondDigit;

  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Listas de nomes e sobrenomes
const names = [
  'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Juliana', 'Rafael', 'Fernanda', 'Bruno', 'Patrícia',
  'Lucas', 'Amanda', 'Diego', 'Letícia', 'Guilherme', 'Vanessa', 'Ricardo', 'Bianca', 'André', 'Camila',
  'Thiago', 'Larissa', 'Felipe', 'Natália', 'Marcos', 'Isabela', 'Vinícius', 'Raquel', 'Renato', 'Tânia',
  'Paulo', 'Elaine', 'Rogério', 'Daniela', 'Alexandre', 'Gabriela', 'Leonardo', 'Sandra', 'Hugo', 'Aline',
  'Eduardo', 'Monique', 'Mauro', 'Regina', 'Cristiano', 'Viviane', 'Sérgio', 'Helena', 'Wagner', 'Rosana',
  'Gustavo', 'Carolina', 'Fábio', 'Tatiane', 'Márcio', 'Simone', 'Rodrigo', 'Cíntia', 'Jorge', 'Adriana',
  'Antônio', 'Michele', 'Débora', 'Ronaldo', 'Jéssica', 'William', 'Priscila', 'Roberto', 'Alessandra', 'Cleber',
  'Daniele', 'Leandro', 'Jaqueline', 'César', 'Luana', 'Vitor', 'Marina', 'Igor', 'Carla', 'Matheus',
  'Sabrina', 'Jean', 'Natalia', 'Mário', 'Lorena', 'Samuel', 'Yasmin', 'Erick', 'Aline', 'Douglas',
  'Cláudia', 'Tiago', 'Lívia', 'Anderson', 'Maiara', 'Júlio', 'Cristina', 'Zé', 'Marta', 'Rafaela',
  'Otávio', 'Sueli', 'Nelson', 'Rita', 'Cauê', 'Luiza', 'Benício', 'Elisa', 'Henry', 'Lidia',
  'Kevin', 'Luna', 'Enzo', 'Clara', 'Joana', 'Kaique', 'Mirela', 'Breno', 'Olivia', 'Laís'
];

const surnames = [
  'Silva', 'Santos', 'Oliveira', 'Costa', 'Rodrigues', 'Pereira', 'Almeida', 'Lima', 'Souza', 'Ferreira',
  'Barbosa', 'Cardoso', 'Martins', 'Rocha', 'Melo', 'Nunes', 'Dias', 'Castro', 'Ribeiro', 'Monteiro',
  'Moraes', 'Campos', 'Duarte', 'Andrade', 'Teixeira', 'Freitas', 'Moreira', 'Gomes', 'Carvalho', 'Brito',
  'Peixoto', 'Porto', 'Miranda', 'Tavares', 'Pinto', 'Macedo', 'Queiroz', 'Ramalho', 'Batista', 'Sales',
  'Fonseca', 'Aragão', 'Medeiros', 'Paiva', 'Leal', 'Bento', 'Caldeira', 'Veloso', 'Meneses', 'Pimentel',
  'Rangel', 'Vieira', 'Nogueira', 'Machado', 'Assis', 'Xavier', 'Sampaio', 'Cruz', 'Aguiar', 'Neves',
  'Lopes', 'Cordeiro', 'Dantas', 'Figueiredo', 'Viana', 'Barros', 'Araújo', 'Correia', 'Mendes', 'Farias',
  'Guedes', 'Morais', 'Rosa', 'Santana', 'Cavalcanti', 'Bispo', 'Muniz', 'Fogaça', 'Pires', 'Azevedo',
  'Magalhães', 'Padilha', 'Pinheiro', 'Mota', 'Chaves', 'Coelho', 'Menezes', 'Mourão', 'Moraes', 'Montalvão',
  'Rios', 'Macedo', 'Márquez', 'Bezerra', 'Milos', 'Miki', 'Nakamura', 'Kim', 'Santos', 'Lima',
  'Alves', 'Costa', 'Pereira', 'Carvalho', 'Gonçalves', 'Ribeiro', 'Martins', 'Jesus', 'Fernandes', 'Vargas'
];

function generateUniqueEmail(name, usedEmails) {
  let email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
  let uniqueEmail = email;
  let count = 1;
  while (usedEmails.has(uniqueEmail)) {
    uniqueEmail = `${name.toLowerCase().replace(/\s+/g, '.')}${count}@example.com`;
    count++;
  }
  usedEmails.add(uniqueEmail);
  return uniqueEmail;
}

async function generateUsersData() {
  const usedEmails = new Set();
  const users = [];

  for (let i = 0; i < 150; i++) {
    const name = `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`;
    const email = generateUniqueEmail(name, usedEmails);
    const cpf = generateCPF();

    users.push({
      cpf,
      password: 'Senha@1234',
      email,
      name
    });
  }

  await fs.writeFile('./users-data.json', JSON.stringify(users, null, 2));
  console.log('✅ Arquivo users-data.json gerado com 150 usuários!');
}

generateUsersData();