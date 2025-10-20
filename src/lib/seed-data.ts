import { prisma } from "./prisma";
import { emailService } from "./services/email.service";
import type { ServiceResult } from "./types/common";

export interface SeedResult {
  usuario: any;
  caixa: any;
  movimentacoes: any[];
}

export async function seedCaixaData(): Promise<ServiceResult<SeedResult>> {
  try {
    // Criar um usuário de teste
    const usuario = await prisma.usuario.upsert({
      where: { email: "teste@oficina.com" },
      update: {},
      create: {
        nome: "Usuário Teste",
        email: "teste@oficina.com",
        senha: "123456",
        role: "ADMIN",
      },
    });

    // Criar um caixa ativo
    const caixa = await prisma.caixa.upsert({
      where: { id: "caixa-teste-1" },
      update: {},
      create: {
        id: "caixa-teste-1",
        valorInicial: 1000.0,
        status: "ABERTO",
        observacoes: "Caixa de teste para desenvolvimento",
        usuarioId: usuario.id,
      },
    });

    // Criar algumas movimentações de teste
    const movimentacoesData = [
      {
        tipo: "ENTRADA" as const,
        valor: 500.0,
        descricao: "Venda de peças",
        categoria: "VENDAS" as const,
        observacoes: "Venda de peças para cliente",
        caixaId: caixa.id,
      },
      {
        tipo: "SAIDA" as const,
        valor: 200.0,
        descricao: "Compra de material",
        categoria: "DESPESAS" as const,
        observacoes: "Compra de material para estoque",
        caixaId: caixa.id,
      },
      {
        tipo: "ENTRADA" as const,
        valor: 300.0,
        descricao: "Serviço de manutenção",
        categoria: "SERVICOS" as const,
        observacoes: "Serviço de manutenção veicular",
        caixaId: caixa.id,
      },
    ];

    const movimentacoes = [];
    for (const mov of movimentacoesData) {
      const movimentacao = await prisma.movimentacaoCaixa.upsert({
        where: {
          id: `mov-${mov.descricao.toLowerCase().replace(/\s+/g, "-")}`,
        },
        update: {},
        create: {
          id: `mov-${mov.descricao.toLowerCase().replace(/\s+/g, "-")}`,
          ...mov,
        },
      });
      movimentacoes.push(movimentacao);
    }

    // Enviar email de notificação (opcional)
    try {
      await emailService.send({
        to: usuario.email,
        template: "caixa-opened",
        data: {
          valorInicial: caixa.valorInicial,
          usuario: usuario.nome,
          observacoes: caixa.observacoes,
        },
      });
    } catch (emailError) {
      console.warn("⚠️ Falha ao enviar email de notificação:", emailError);
    }

    console.log("✅ Dados de teste criados com sucesso!");
    return {
      success: true,
      data: { usuario, caixa, movimentacoes },
    };
  } catch (error) {
    console.error("❌ Erro ao criar dados de teste:", error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        code: "SEED_DATA_FAILED",
        statusCode: 500,
      },
    };
  }
}

export async function seedClientesData(): Promise<ServiceResult<any[]>> {
  try {
    const clientesData = [
      {
        nome: "João Silva",
        email: "joao.silva@email.com",
        telefone: "(11) 99999-9999",
        endereco: "Rua das Flores, 123",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01234-567",
        cpf: "123.456.789-00",
        rg: "12.345.678-9",
        dataNascimento: new Date("1985-05-15"),
        observacoes: "Cliente preferencial",
      },
      {
        nome: "Maria Santos",
        email: "maria.santos@email.com",
        telefone: "(11) 88888-8888",
        endereco: "Av. Paulista, 456",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01310-100",
        cpf: "987.654.321-00",
        rg: "98.765.432-1",
        dataNascimento: new Date("1990-08-22"),
        observacoes: "Cliente novo",
      },
      {
        nome: "Pedro Oliveira",
        email: "pedro.oliveira@email.com",
        telefone: "(11) 77777-7777",
        endereco: "Rua da Consolação, 789",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01302-000",
        cpf: "456.789.123-00",
        rg: "45.678.912-3",
        dataNascimento: new Date("1988-12-10"),
        observacoes: "Cliente corporativo",
      },
    ];

    const clientes = [];
    for (const clienteData of clientesData) {
      const cliente = await prisma.cliente.upsert({
        where: { email: clienteData.email },
        update: {},
        create: clienteData,
      });
      clientes.push(cliente);
    }

    console.log("✅ Clientes de teste criados com sucesso!");
    return { success: true, data: clientes };
  } catch (error) {
    console.error("❌ Erro ao criar clientes de teste:", error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        code: "SEED_CLIENTES_FAILED",
        statusCode: 500,
      },
    };
  }
}

export async function seedProdutosData(): Promise<ServiceResult<any[]>> {
  try {
    const produtosData = [
      {
        codigo: "P001",
        nome: "Filtro de Óleo",
        descricao: "Filtro de óleo para motor 1.0",
        preco: 25.5,
        quantidade: 50,
        quantidadeMinima: 10,
        categoria: "FILTROS",
        marca: "Mann Filter",
        modelo: "W712/75",
        unidade: "UN",
        observacoes: "Compatível com vários modelos",
      },
      {
        codigo: "P002",
        nome: "Pastilha de Freio",
        descricao: "Pastilha de freio dianteira",
        preco: 89.9,
        quantidade: 25,
        quantidadeMinima: 5,
        categoria: "FREIOS",
        marca: "Brembo",
        modelo: "P85020",
        unidade: "PAR",
        observacoes: "Para veículos compactos",
      },
      {
        codigo: "P003",
        nome: "Bateria 60Ah",
        descricao: "Bateria automotiva 60Ah",
        preco: 350.0,
        quantidade: 8,
        quantidadeMinima: 3,
        categoria: "ELETRICOS",
        marca: "Moura",
        modelo: "M60B",
        unidade: "UN",
        observacoes: "12V, 60Ah, 600A",
      },
    ];

    const produtos = [];
    for (const produtoData of produtosData) {
      const produto = await prisma.produto.upsert({
        where: { codigo: produtoData.codigo },
        update: {},
        create: produtoData,
      });
      produtos.push(produto);
    }

    console.log("✅ Produtos de teste criados com sucesso!");
    return { success: true, data: produtos };
  } catch (error) {
    console.error("❌ Erro ao criar produtos de teste:", error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        code: "SEED_PRODUTOS_FAILED",
        statusCode: 500,
      },
    };
  }
}

export async function seedAllData(): Promise<
  ServiceResult<{
    caixa: any;
    clientes: any[];
    produtos: any[];
  }>
> {
  try {
    const caixaResult = await seedCaixaData();
    if (!caixaResult.success) {
      return caixaResult;
    }

    const clientesResult = await seedClientesData();
    if (!clientesResult.success) {
      return clientesResult;
    }

    const produtosResult = await seedProdutosData();
    if (!produtosResult.success) {
      return produtosResult;
    }

    console.log("✅ Todos os dados de teste foram criados com sucesso!");
    return {
      success: true,
      data: {
        caixa: caixaResult.data,
        clientes: clientesResult.data,
        produtos: produtosResult.data,
      },
    };
  } catch (error) {
    console.error("❌ Erro ao criar todos os dados de teste:", error);
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        code: "SEED_ALL_FAILED",
        statusCode: 500,
      },
    };
  }
}
