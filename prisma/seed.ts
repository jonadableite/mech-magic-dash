import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados...");

  // Criar clientes
  const clientes = await Promise.all([
    prisma.cliente.create({
      data: {
        nome: "João Silva",
        email: "joao.silva@email.com",
        telefone: "(11) 98765-4321",
        endereco: "Rua das Flores, 123 - São Paulo/SP",
      },
    }),
    prisma.cliente.create({
      data: {
        nome: "Maria Santos",
        email: "maria.santos@email.com",
        telefone: "(11) 97654-3210",
        endereco: "Av. Paulista, 456 - São Paulo/SP",
      },
    }),
    prisma.cliente.create({
      data: {
        nome: "Pedro Oliveira",
        email: "pedro.oliveira@email.com",
        telefone: "(11) 96543-2109",
        endereco: "Rua Augusta, 789 - São Paulo/SP",
      },
    }),
    prisma.cliente.create({
      data: {
        nome: "Ana Costa",
        email: "ana.costa@email.com",
        telefone: "(11) 95432-1098",
        endereco: "Rua Oscar Freire, 321 - São Paulo/SP",
      },
    }),
  ]);

  console.log(`${clientes.length} clientes criados`);

  // Criar veículos
  const veiculos = await Promise.all([
    prisma.veiculo.create({
      data: {
        marca: "Honda",
        modelo: "Civic",
        ano: 2020,
        placa: "ABC-1234",
        cor: "Prata",
        observacoes: "Veículo em bom estado",
        clienteId: clientes[0].id,
      },
    }),
    prisma.veiculo.create({
      data: {
        marca: "Toyota",
        modelo: "Corolla",
        ano: 2019,
        placa: "DEF-5678",
        cor: "Branco",
        observacoes: "Necessita revisão",
        clienteId: clientes[1].id,
      },
    }),
    prisma.veiculo.create({
      data: {
        marca: "Ford",
        modelo: "Focus",
        ano: 2021,
        placa: "GHI-9012",
        cor: "Azul",
        clienteId: clientes[2].id,
      },
    }),
    prisma.veiculo.create({
      data: {
        marca: "Volkswagen",
        modelo: "Golf",
        ano: 2018,
        placa: "JKL-3456",
        cor: "Preto",
        observacoes: "Veículo com histórico de manutenção",
        clienteId: clientes[3].id,
      },
    }),
  ]);

  console.log(`${veiculos.length} veículos criados`);

  // Criar produtos
  const produtos = await Promise.all([
    prisma.produto.create({
      data: {
        nome: "Óleo de Motor 5W30",
        descricao: "Óleo sintético para motor",
        codigo: "OLEO-5W30",
        preco: 89.9,
        quantidade: 5,
        quantidadeMinima: 20,
        categoria: "Óleos",
        fornecedor: "Shell",
      },
    }),
    prisma.produto.create({
      data: {
        nome: "Filtro de Ar",
        descricao: "Filtro de ar para motor",
        codigo: "FILTRO-AR",
        preco: 45.5,
        quantidade: 8,
        quantidadeMinima: 15,
        categoria: "Filtros",
        fornecedor: "Mann",
      },
    }),
    prisma.produto.create({
      data: {
        nome: "Pastilha de Freio",
        descricao: "Pastilha de freio dianteira",
        codigo: "PASTILHA-FR",
        preco: 125.0,
        quantidade: 3,
        quantidadeMinima: 10,
        categoria: "Freios",
        fornecedor: "Brembo",
      },
    }),
    prisma.produto.create({
      data: {
        nome: "Bateria 60Ah",
        descricao: "Bateria automotiva 60Ah",
        codigo: "BATERIA-60",
        preco: 299.9,
        quantidade: 12,
        quantidadeMinima: 8,
        categoria: "Elétrica",
        fornecedor: "Moura",
      },
    }),
    prisma.produto.create({
      data: {
        nome: "Pneu 205/55 R16",
        descricao: "Pneu radial 205/55 R16",
        codigo: "PNEU-20555",
        preco: 399.9,
        quantidade: 25,
        quantidadeMinima: 12,
        categoria: "Pneus",
        fornecedor: "Michelin",
      },
    }),
  ]);

  console.log(`${produtos.length} produtos criados`);

  // Criar ordens de serviço
  const ordens = await Promise.all([
    prisma.ordemServico.create({
      data: {
        numero: "#OS-0001",
        descricao: "Troca de óleo e filtro",
        status: "EM_ANDAMENTO",
        prioridade: "ALTA",
        valorTotal: 135.4,
        dataAbertura: new Date(),
        observacoes: "Cliente solicitou urgência",
        clienteId: clientes[0].id,
        veiculoId: veiculos[0].id,
        itens: {
          create: [
            {
              descricao: "Óleo de Motor 5W30",
              quantidade: 1,
              valorUnitario: 89.9,
              valorTotal: 89.9,
            },
            {
              descricao: "Filtro de Óleo",
              quantidade: 1,
              valorUnitario: 45.5,
              valorTotal: 45.5,
            },
          ],
        },
      },
    }),
    prisma.ordemServico.create({
      data: {
        numero: "#OS-0002",
        descricao: "Revisão completa",
        status: "AGUARDANDO_PECAS",
        prioridade: "MEDIA",
        valorTotal: 0,
        dataAbertura: new Date(),
        clienteId: clientes[1].id,
        veiculoId: veiculos[1].id,
      },
    }),
    prisma.ordemServico.create({
      data: {
        numero: "#OS-0003",
        descricao: "Troca de pastilhas de freio",
        status: "FINALIZADA",
        prioridade: "ALTA",
        valorTotal: 250.0,
        dataAbertura: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dataFechamento: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        clienteId: clientes[2].id,
        veiculoId: veiculos[2].id,
        itens: {
          create: [
            {
              descricao: "Pastilha de Freio Dianteira",
              quantidade: 2,
              valorUnitario: 125.0,
              valorTotal: 250.0,
            },
          ],
        },
      },
    }),
    prisma.ordemServico.create({
      data: {
        numero: "#OS-0004",
        descricao: "Diagnóstico elétrico",
        status: "ABERTA",
        prioridade: "BAIXA",
        valorTotal: 0,
        dataAbertura: new Date(),
        clienteId: clientes[3].id,
        veiculoId: veiculos[3].id,
      },
    }),
  ]);

  console.log(`${ordens.length} ordens de serviço criadas`);

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
