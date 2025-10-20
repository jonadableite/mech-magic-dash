import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Criar usuários de exemplo
  const adminPassword = await bcrypt.hash("123456", 12);
  const userPassword = await bcrypt.hash("123456", 12);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@oficina.com" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@oficina.com",
      senha: adminPassword,
      role: "ADMIN",
    },
  });

  const user = await prisma.usuario.upsert({
    where: { email: "user@oficina.com" },
    update: {},
    create: {
      nome: "Usuário Padrão",
      email: "user@oficina.com",
      senha: userPassword,
      role: "USUARIO",
    },
  });

  console.log("✅ Usuários criados:", { admin: admin.email, user: user.email });

  // Criar dados de exemplo para o admin
  const clienteAdmin = await prisma.cliente.upsert({
    where: {
      email_usuarioId: {
        email: "joao@email.com",
        usuarioId: admin.id,
      },
    },
    update: {},
    create: {
      nome: "João Silva",
      email: "joao@email.com",
      telefone: "(11) 99999-9999",
      endereco: "Rua das Flores, 123",
      usuarioId: admin.id,
    },
  });

  const veiculoAdmin = await prisma.veiculo.upsert({
    where: {
      placa_usuarioId: {
        placa: "ABC-1234",
        usuarioId: admin.id,
      },
    },
    update: {},
    create: {
      marca: "Toyota",
      modelo: "Corolla",
      ano: 2020,
      placa: "ABC-1234",
      cor: "Prata",
      clienteId: clienteAdmin.id,
      usuarioId: admin.id,
    },
  });

  const produtoAdmin = await prisma.produto.upsert({
    where: {
      codigo_usuarioId: {
        codigo: "OLEO001",
        usuarioId: admin.id,
      },
    },
    update: {},
    create: {
      nome: "Óleo Motor 5W30",
      descricao: "Óleo sintético para motor",
      codigo: "OLEO001",
      preco: 45.9,
      quantidade: 50,
      quantidadeMinima: 10,
      categoria: "Lubrificantes",
      fornecedor: "Petrobras",
      usuarioId: admin.id,
    },
  });

  const ordemAdmin = await prisma.ordemServico.upsert({
    where: {
      numero_usuarioId: {
        numero: "OS-001",
        usuarioId: admin.id,
      },
    },
    update: {},
    create: {
      numero: "OS-001",
      descricao: "Troca de óleo e filtro",
      status: "ABERTA",
      prioridade: "MEDIA",
      valorTotal: 120.0,
      clienteId: clienteAdmin.id,
      veiculoId: veiculoAdmin.id,
      usuarioId: admin.id,
    },
  });

  const agendamentoAdmin = await prisma.agendamento.create({
    data: {
      dataHora: new Date("2024-01-15T10:00:00Z"),
      descricao: "Revisão preventiva",
      status: "AGENDADO",
      clienteId: clienteAdmin.id,
      veiculoId: veiculoAdmin.id,
      usuarioId: admin.id,
    },
  });

  const caixaAdmin = await prisma.caixa.create({
    data: {
      valorInicial: 1000.0,
      status: "ABERTO",
      usuarioId: admin.id,
    },
  });

  const contaPagarAdmin = await prisma.contaPagar.create({
    data: {
      descricao: "Aluguel da oficina",
      valor: 2500.0,
      dataVencimento: new Date("2024-01-31"),
      categoria: "MANUTENCAO",
      fornecedor: "Imobiliária XYZ",
      usuarioId: admin.id,
    },
  });

  const contaReceberAdmin = await prisma.contaReceber.create({
    data: {
      descricao: "Serviço de manutenção",
      valor: 500.0,
      dataVencimento: new Date("2024-01-20"),
      categoria: "CLIENTES",
      clienteId: clienteAdmin.id,
      usuarioId: admin.id,
    },
  });

  // Criar dados de exemplo para o usuário comum
  const clienteUser = await prisma.cliente.upsert({
    where: {
      email_usuarioId: {
        email: "maria@email.com",
        usuarioId: user.id,
      },
    },
    update: {},
    create: {
      nome: "Maria Santos",
      email: "maria@email.com",
      telefone: "(11) 88888-8888",
      endereco: "Av. Principal, 456",
      usuarioId: user.id,
    },
  });

  const veiculoUser = await prisma.veiculo.upsert({
    where: {
      placa_usuarioId: {
        placa: "XYZ-5678",
        usuarioId: user.id,
      },
    },
    update: {},
    create: {
      marca: "Honda",
      modelo: "Civic",
      ano: 2019,
      placa: "XYZ-5678",
      cor: "Branco",
      clienteId: clienteUser.id,
      usuarioId: user.id,
    },
  });

  const produtoUser = await prisma.produto.upsert({
    where: {
      codigo_usuarioId: {
        codigo: "FILTRO001",
        usuarioId: user.id,
      },
    },
    update: {},
    create: {
      nome: "Filtro de Ar",
      descricao: "Filtro de ar condicionado",
      codigo: "FILTRO001",
      preco: 25.5,
      quantidade: 30,
      quantidadeMinima: 5,
      categoria: "Filtros",
      fornecedor: "Mann Filter",
      usuarioId: user.id,
    },
  });

  console.log("✅ Dados de exemplo criados para ambos os usuários");
  console.log("📊 Resumo:");
  console.log(
    `   - Admin: 1 cliente, 1 veículo, 1 produto, 1 ordem, 1 agendamento, 1 caixa`
  );
  console.log(`   - User: 1 cliente, 1 veículo, 1 produto`);
  console.log("🔒 Todos os dados estão isolados por usuário!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
