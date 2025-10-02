import React, { useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';
import ClienteCreateModal from '../../components/ClienteCreateModal'; // ✅ CORRIGIDO

// ✅ Interfaces baseadas nas suas tabelas
interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria?: { nome: string };
  estoque?: { quantidade: number };
  codigo_barras?: string;
  preco_formatado: string;
}

interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone_formatado?: string;
  conta_fiada?: { saldo: number; saldo_formatado: string };
}

interface ItemVenda {
  produto_id: number;
  produto: Produto;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

interface Venda {
  id: number;
  total: number;
  total_formatado: string;
  desconto: number;
  forma_pagamento: string;
  status: string;
  cliente?: Cliente;
  itens: ItemVenda[];
  created_at: string;
  observacoes?: string;
}

interface Props {
  vendas: Venda[];
  produtos: Produto[];
  clientes: Cliente[];
  error?: string;
}

export default function Vendas({ vendas = [], produtos = [], clientes = [], error }: Props) {
  // Estados para controlar as abas
  const [abaAtiva, setAbaAtiva] = useState<'lista' | 'nova'>('lista');
  
  // Estados do PDV (Nova Venda)
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [busca, setBusca] = useState('');
  const [produtosFiltrados, setProdutosFiltrados] = useState(produtos);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [desconto, setDesconto] = useState<number>(0);
  const [observacoes, setObservacoes] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [valorRecebido, setValorRecebido] = useState<number>(0);

  // Estados da listagem
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
  const [showDetalhes, setShowDetalhes] = useState(false);

  // ✅ ESTADO AUSENTE ADICIONADO
  const [showClienteModal, setShowClienteModal] = useState(false);

  const { data, setData, post, processing } = useForm({});

  // 🔍 Filtrar produtos em tempo real
  useEffect(() => {
    const filtrados = produtos.filter(produto =>
      produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
      produto.codigo_barras?.includes(busca) ||
      produto.categoria?.nome.toLowerCase().includes(busca.toLowerCase())
    );
    setProdutosFiltrados(filtrados);
  }, [busca, produtos]);

  // ➕ Adicionar produto ao carrinho
  const adicionarAoCarrinho = (produto: Produto, quantidade: number = 1) => {
    // Verificar estoque
    if (produto.estoque && produto.estoque.quantidade < quantidade) {
      alert(`Estoque insuficiente! Disponível: ${produto.estoque.quantidade}`);
      return;
    }

    const itemExistente = carrinho.find(item => item.produto_id === produto.id);
    
    if (itemExistente) {
      const novaQuantidade = itemExistente.quantidade + quantidade;
      if (produto.estoque && produto.estoque.quantidade < novaQuantidade) {
        alert(`Estoque insuficiente! Máximo: ${produto.estoque.quantidade}`);
        return;
      }
      
      setCarrinho(carrinho.map(item => 
        item.produto_id === produto.id
          ? {
              ...item,
              quantidade: novaQuantidade,
              preco_unitario: Number(item.preco_unitario), // ✅ GARANTIR NÚMERO
              subtotal: novaQuantidade * Number(item.preco_unitario) // ✅ GARANTIR NÚMERO
            }
          : item
      ));
    } else {
      const novoItem: ItemVenda = {
        produto_id: produto.id,
        produto,
        quantidade,
        preco_unitario: Number(produto.preco), // ✅ GARANTIR NÚMERO
        subtotal: quantidade * Number(produto.preco), // ✅ GARANTIR NÚMERO
      };
      setCarrinho([...carrinho, novoItem]);
    }
    
    setBusca('');
  };

  // ✏️ Editar quantidade no carrinho
  const editarQuantidade = (produtoId: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(produtoId);
      return;
    }

    const item = carrinho.find(item => item.produto_id === produtoId);
    if (!item) return;

    if (item.produto.estoque && item.produto.estoque.quantidade < novaQuantidade) {
      alert(`Estoque insuficiente! Máximo: ${item.produto.estoque.quantidade}`);
      return;
    }

    setCarrinho(carrinho.map(item => 
      item.produto_id === produtoId
        ? {
            ...item,
            quantidade: novaQuantidade,
            subtotal: novaQuantidade * item.preco_unitario
          }
        : item
    ));
  };

  // ❌ Remover item do carrinho
  const removerDoCarrinho = (produtoId: number) => {
    setCarrinho(carrinho.filter(item => item.produto_id !== produtoId));
  };

  // 💰 Cálculos
  const calcularSubtotal = () => carrinho.reduce((total, item) => total + item.subtotal, 0);
  const calcularTotal = () => calcularSubtotal() - desconto;
  const calcularTroco = () => valorRecebido ? Math.max(0, valorRecebido - calcularTotal()) : 0;

  // ✅ Finalizar venda
  const finalizarVenda = async () => {
    console.log('🚀 finalizarVenda chamada!');
    
    if (carrinho.length === 0) {
      alert('Adicione pelo menos um produto à venda!');
      return;
    }

    const total = calcularTotal();
    
    if (formaPagamento === 'dinheiro' && (!valorRecebido || valorRecebido < total)) {
      alert('Valor recebido insuficiente!');
      return;
    }

    if (formaPagamento === 'conta_fiada' && !clienteSelecionado) {
      alert('Selecione um cliente para venda fiada!');
      return;
    }

    const dadosVenda = {
      itens: carrinho.map(item => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
      })),
      cliente_id: clienteSelecionado?.id || null,
      forma_pagamento: formaPagamento,
      desconto: desconto,
      observacoes: observacoes,
      valor_recebido: valorRecebido,
    };

    console.log('📦 Dados da venda antes do envio:', dadosVenda);
    console.log('� Estado do carrinho:', carrinho);
    console.log('🔍 Cliente selecionado:', clienteSelecionado);
    console.log('🔍 Forma de pagamento:', formaPagamento);
    console.log('🔍 Desconto:', desconto);
    console.log('🔍 Observações:', observacoes);
    console.log('🔍 Valor recebido:', valorRecebido);
    
    try {
      // Usar uma abordagem mais explícita com fetch
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      console.log('🔑 CSRF Token:', csrfToken);

      const response = await fetch('/gerenciamento/vendas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(dadosVenda),
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        // Tentar processar como JSON
        try {
          const responseData = await response.json();
          console.log('✅ Venda processada com sucesso!', responseData);
          
          // Limpar carrinho e voltar para lista
          setCarrinho([]);
          setClienteSelecionado(null);
          setDesconto(0);
          setValorRecebido(0);
          setObservacoes('');
          setBusca('');
          setAbaAtiva('lista');
          
          // Recarregar a página para atualizar os dados do histórico
          window.location.reload();
          
        } catch (jsonError) {
          // Se não conseguir processar como JSON, ainda considera sucesso
          console.log('✅ Venda processada (resposta não-JSON)');
          
          // Limpar carrinho e voltar para lista
          setCarrinho([]);
          setClienteSelecionado(null);
          setDesconto(0);
          setValorRecebido(0);
          setObservacoes('');
          setBusca('');
          setAbaAtiva('lista');
          
          // Recarregar a página para atualizar os dados do histórico
          window.location.reload();
        }
      } else {
        let errorMessage = 'Erro desconhecido';
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || 'Erro na requisição';
            console.error('❌ Erro JSON:', errorData);
          } else {
            const errorText = await response.text();
            errorMessage = `Erro HTTP ${response.status}`;
            console.error('❌ Erro HTML/Text:', errorText.substring(0, 500));
          }
        } catch (parseError) {
          console.error('❌ Erro ao processar resposta de erro:', parseError);
        }
        
        alert('Erro ao finalizar venda: ' + errorMessage);
      }
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      alert('Erro ao conectar com o servidor.');
    }
  };

  // 📋 Filtrar vendas
  const vendasFiltradas = vendas.filter(venda => {
    const filtroStatusMatch = !filtroStatus || venda.status === filtroStatus;
    const filtroClienteMatch = !filtroCliente || venda.cliente?.id === parseInt(filtroCliente);
    return filtroStatusMatch && filtroClienteMatch;
  });

  // Helper para garantir formatação de valores
  const formatarMoeda = (valor: any): string => {
    return Number(valor || 0).toFixed(2).replace('.', ',');
  };

  return (
    <GerenciamentoLayout>
      <Head title="Vendas" />
      
      <div className="container-fluid py-4">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
          </div>
        )}

        {/* Header com Abas */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">
            <i className="bi bi-receipt me-2 text-primary"></i>
            Vendas
          </h2>
          
          {/* Navegação por Abas */}
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button
                className={`nav-link ${abaAtiva === 'lista' ? 'active' : ''}`}
                onClick={() => setAbaAtiva('lista')}
              >
                <i className="bi bi-list me-2"></i>
                Histórico de Vendas
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${abaAtiva === 'nova' ? 'active' : ''}`}
                onClick={() => setAbaAtiva('nova')}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Nova Venda
              </button>
            </li>
          </ul>
        </div>

        {/* Conteúdo das Abas */}
        {abaAtiva === 'lista' ? (
          /* ABA 1: LISTA DE VENDAS */
          <div className="row fade-in">
            <div className="col-12">
              {/* Filtros */}
              <div className="card filtros-card mb-3">
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value)}
                      >
                        <option value="">Todos os status</option>
                        <option value="concluida">✅ Concluída</option>
                        <option value="conta_fiada">📋 Conta Fiada</option>
                        <option value="cancelada">❌ Cancelada</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Cliente</label>
                      <select
                        className="form-select"
                        value={filtroCliente}
                        onChange={(e) => setFiltroCliente(e.target.value)}
                      >
                        <option value="">Todos os clientes</option>
                        {clientes.map(cliente => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                      <button
                        className="btn btn-outline-secondary btn-limpar-filtros me-2"
                        onClick={() => {
                          setFiltroStatus('');
                          setFiltroCliente('');
                        }}
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Limpar Filtros
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabela de Vendas */}
              <div className="card">
                <div className="card-header bg-white">
                  <h5 className="mb-0">
                    <i className="bi bi-receipt-cutoff me-2"></i>
                    Histórico ({vendasFiltradas.length} vendas)
                  </h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive scroll-shadow">
                    <table className="table table-hover vendas-table mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Data/Hora</th>
                          <th>Cliente</th>
                          <th>Total</th>
                          <th>Pagamento</th>
                          <th>Status</th>
                          <th className="text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendasFiltradas.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="estado-vazio">
                              <i className="bi bi-receipt display-6 d-block mb-2"></i>
                              Nenhuma venda encontrada
                            </td>
                          </tr>
                        ) : (
                          vendasFiltradas.map(venda => (
                            <tr key={venda.id}>
                              <td>
                                <span className="badge bg-secondary venda-id">#{venda.id}</span>
                              </td>
                              <td>
                                {new Date(venda.created_at).toLocaleString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td>
                                {venda.cliente ? (
                                  <div className="cliente-info">
                                    <div className="cliente-nome">{venda.cliente.nome}</div>
                                    <small className="cliente-email">{venda.cliente.email}</small>
                                  </div>
                                ) : (
                                  <span className="text-muted">Venda avulsa</span>
                                )}
                              </td>
                              <td>
                                <strong className="text-success">
                                  {venda.total_formatado}
                                </strong>
                                {venda.desconto > 0 && (
                                  <small className="d-block text-muted">
                                    Desconto: R$ {venda.desconto.toFixed(2).replace('.', ',')}
                                  </small>
                                )}
                              </td>
                              <td>
                                <span className="badge bg-light text-dark">
                                  {venda.forma_pagamento === 'dinheiro' && '💵 Dinheiro'}
                                  {venda.forma_pagamento === 'pix' && '📱 PIX'}
                                  {venda.forma_pagamento === 'cartao_debito' && '💳 Débito'}
                                  {venda.forma_pagamento === 'cartao_credito' && '💳 Crédito'}
                                  {venda.forma_pagamento === 'conta_fiada' && '📋 Fiado'}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${
                                  venda.status === 'concluida' ? 'bg-success' :
                                  venda.status === 'conta_fiada' ? 'bg-info' :
                                  venda.status === 'cancelada' ? 'bg-danger' : 'bg-warning'
                                }`}>
                                  {venda.status === 'concluida' && '✅ Concluída'}
                                  {venda.status === 'conta_fiada' && '📋 Fiado'}
                                  {venda.status === 'cancelada' && '❌ Cancelada'}
                                  {venda.status === 'pendente' && '⏳ Pendente'}
                                </span>
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => {
                                    setVendaSelecionada(venda);
                                    setShowDetalhes(true);
                                  }}
                                  title="Ver detalhes"
                                >
                                  <i className="bi bi-eye"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ABA 2: NOVA VENDA (PDV) */
          <div className="row fade-in">
            {/* Coluna Esquerda - Produtos */}
            <div className="col-lg-8">
              <div className="card h-100">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-shop me-2"></i>
                    Produtos Disponíveis
                  </h5>
                </div>
                <div className="card-body">
                  {/* Busca */}
                  <div className="mb-3">
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="🔍 Buscar produto por nome, código ou categoria..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        autoFocus
                      />
                      {busca && (
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={() => setBusca('')}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Lista de Produtos */}
                  <div className="carrinho-lista">
                    <div className="row g-2">
                      {produtosFiltrados.length === 0 ? (
                        <div className="col-12 estado-vazio">
                          <i className="bi bi-search display-4 d-block mb-2"></i>
                          {busca ? 'Nenhum produto encontrado' : 'Digite para buscar produtos'}
                        </div>
                      ) : (
                        produtosFiltrados.map(produto => (
                          <div key={produto.id} className="col-md-6 col-lg-4">
                            <div 
                              className="card h-100 produto-card"
                              onClick={() => adicionarAoCarrinho(produto)}
                            >
                              <div className="card-body p-3">
                                <h6 className="card-title mb-2 text-truncate">
                                  {produto.nome}
                                </h6>
                                <p className="card-text small text-muted mb-2">
                                  {produto.categoria?.nome || 'Sem categoria'}
                                </p>
                                <div className="d-flex justify-content-between align-items-center">
                                  <strong className="text-success">
                                    {produto.preco_formatado}
                                  </strong>
                                  <small className={`badge ${
                                    (produto.estoque?.quantidade || 0) > 5 ? 'bg-success' :
                                    (produto.estoque?.quantidade || 0) > 0 ? 'bg-warning' : 'bg-danger'
                                  }`}>
                                    Est: {produto.estoque?.quantidade || 0}
                                  </small>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna Direita - Carrinho */}
            <div className="col-lg-4">
              <div className="card h-100 carrinho-container">
                <div className="card-header carrinho-header text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-cart me-2"></i>
                    Carrinho ({carrinho.length} {carrinho.length === 1 ? 'item' : 'itens'})
                  </h5>
                </div>
                <div className="card-body d-flex flex-column">
                  {/* Itens do Carrinho */}
                  <div className="flex-grow-1 mb-3 carrinho-lista">
                    {carrinho.length === 0 ? (
                      <div className="estado-vazio">
                        <i className="bi bi-cart-x display-6 d-block mb-2"></i>
                        Carrinho vazio
                      </div>
                    ) : (
                      carrinho.map(item => (
                        <div key={item.produto_id} className="card mb-2 carrinho-item">
                          <div className="card-body p-2">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <small className="produto-nome flex-grow-1 me-2">
                                {item.produto.nome}
                              </small>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removerDoCarrinho(item.produto_id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="input-group quantidade-controles" style={{ maxWidth: '100px' }}>
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => editarQuantidade(item.produto_id, item.quantidade - 1)}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-center"
                                  value={item.quantidade}
                                  onChange={(e) => editarQuantidade(item.produto_id, parseInt(e.target.value) || 0)}
                                  min="1"
                                />
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => editarQuantidade(item.produto_id, item.quantidade + 1)}
                                >
                                  +
                                </button>
                              </div>
                              
                              <div className="text-end">
                                <small className="preco-info d-block">
                                  R$ {formatarMoeda(item.preco_unitario)} × {item.quantidade}
                                </small>
                                <strong className="subtotal">
                                  R$ {item.subtotal.toFixed(2).replace('.', ',')}
                                </strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Configurações da Venda */}
                  {carrinho.length > 0 && (
                    <>
                      {/* Forma de pagamentos */}
                      <div className="row mb-3">
                        <div className="col-12 mb-3">
                          <label className="form-label small">Forma de Pagamento</label>
                          <div className="pagamento-opcoes">
                            <div className="row g-2">
                              <div className="col-6 col-md-3">
                                <input 
                                  type="radio" 
                                  className="btn-check" 
                                  name="formaPagamento" 
                                  id="dinheiro" 
                                  value="dinheiro"
                                  checked={formaPagamento === 'dinheiro'}
                                  onChange={(e) => setFormaPagamento(e.target.value)}
                                />
                                <label className="btn btn-outline-primary w-100 d-flex flex-column align-items-center py-3" htmlFor="dinheiro">
                                  <i className="bi bi-cash-coin fs-4 mb-2"></i>
                                  <span className="small">Dinheiro</span>
                                </label>
                              </div>
                              
                              <div className="col-6 col-md-3">
                                <input 
                                  type="radio" 
                                  className="btn-check" 
                                  name="formaPagamento" 
                                  id="pix" 
                                  value="pix"
                                  checked={formaPagamento === 'pix'}
                                  onChange={(e) => setFormaPagamento(e.target.value)}
                                />
                                <label className="btn btn-outline-primary w-100 d-flex flex-column align-items-center py-3" htmlFor="pix">
                                  <i className="bi bi-qr-code fs-4 mb-2"></i>
                                  <span className="small">PIX</span>
                                </label>
                              </div>
                              
                              <div className="col-6 col-md-3">
                                <input 
                                  type="radio" 
                                  className="btn-check" 
                                  name="formaPagamento" 
                                  id="cartao_debito" 
                                  value="cartao_debito"
                                  checked={formaPagamento === 'cartao_debito'}
                                  onChange={(e) => setFormaPagamento(e.target.value)}
                                />
                                <label className="btn btn-outline-primary w-100 d-flex flex-column align-items-center py-3" htmlFor="cartao_debito">
                                  <i className="bi bi-credit-card-2-front fs-4 mb-2"></i>
                                  <span className="small">Débito</span>
                                </label>
                              </div>
                              
                              <div className="col-6 col-md-3">
                                <input 
                                  type="radio" 
                                  className="btn-check" 
                                  name="formaPagamento" 
                                  id="cartao_credito" 
                                  value="cartao_credito"
                                  checked={formaPagamento === 'cartao_credito'}
                                  onChange={(e) => setFormaPagamento(e.target.value)}
                                />
                                <label className="btn btn-outline-primary w-100 d-flex flex-column align-items-center py-3" htmlFor="cartao_credito">
                                  <i className="bi bi-credit-card fs-4 mb-2"></i>
                                  <span className="small">Crédito</span>
                                </label>
                              </div>
                              
                              <div className="col-12 col-md-6">
                                <input 
                                  type="radio" 
                                  className="btn-check" 
                                  name="formaPagamento" 
                                  id="conta_fiada" 
                                  value="conta_fiada"
                                  checked={formaPagamento === 'conta_fiada'}
                                  onChange={(e) => setFormaPagamento(e.target.value)}
                                />
                                <label className="btn btn-outline-primary w-100 d-flex flex-column align-items-center py-3" htmlFor="conta_fiada">
                                  <i className="bi bi-wallet2 fs-4 mb-2"></i>
                                  <span className="small">Conta Fiada</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Cliente só aparece quando for conta fiada */}
                        {formaPagamento === 'conta_fiada' && (
                          <div className="col-12 mb-3">
                            <label className="form-label small">Cliente</label>
                            <div className="d-flex gap-2">
                              <select
                                className="form-select form-select-sm"
                                value={clienteSelecionado?.id || ''}
                                onChange={(e) => {
                                  const cliente = clientes.find(c => c.id === parseInt(e.target.value));
                                  setClienteSelecionado(cliente || null);
                                }}
                              >
                                <option value="">Selecionar cliente...</option>
                                {clientes.map(cliente => (
                                  <option key={cliente.id} value={cliente.id}>
                                    {cliente.nome} - {cliente.email}
                                  </option>
                                ))}
                              </select>
                              <button 
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => setShowClienteModal(true)}
                                title="Cadastrar novo cliente"
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                            
                            {!clienteSelecionado && (
                              <div className="alert alert-warning alert-sm mt-2 mb-0">
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                <small>Selecione um cliente ou cadastre um novo para venda fiada</small>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Valor recebido só para dinheiro */}
                      {formaPagamento === 'dinheiro' && (
                        <div className="row mb-2">
                          <div className="col-md-6 mb-3">
                            <label className="form-label small">Valor Recebido</label>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text">R$</span>
                              <input
                                type="number"
                                className="form-control"
                                step="0.01"
                                min="0"
                                value={valorRecebido || 0} // ✅ CORRIGIDO
                                onChange={(e) => setValorRecebido(parseFloat(e.target.value) || 0)}
                                placeholder="0,00"
                              />
                            </div>
                            {/* ✅ VERIFICAÇÃO CORRIGIDA */}
                            {valorRecebido && valorRecebido > 0 && valorRecebido >= calcularTotal() && (
                              <small className="text-success">
                                Troco: R$ {(valorRecebido - calcularTotal()).toFixed(2).replace('.', ',')}
                              </small>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Desconto */}
                      <div className="mb-3">
                        <label className="form-label small">Desconto</label>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text">R$</span>
                          <input
                            type="number"
                            className="form-control"
                            step="0.01"
                            min="0"
                            max={calcularSubtotal()}
                            value={desconto}
                            onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>

                      {/* Total */}
                      <div className="card resumo-venda mb-3">
                        <div className="card-body p-2">
                          <div className="resumo-linha">
                            <small>Subtotal:</small>
                            <small>R$ {calcularSubtotal().toFixed(2).replace('.', ',')}</small>
                          </div>
                          {desconto > 0 && (
                            <div className="resumo-linha desconto">
                              <small>Desconto:</small>
                              <small>- R$ {desconto.toFixed(2).replace('.', ',')}</small>
                            </div>
                          )}
                          <div className="divider"></div>
                          <div className="resumo-linha total">
                            <span>TOTAL:</span>
                            <span>R$ {calcularTotal().toFixed(2).replace('.', ',')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Botão Finalizar */}
                      <button
                        className={`btn btn-finalizar-venda w-100 ${processing ? 'processing' : ''}`}
                        onClick={finalizarVenda}
                        disabled={processing}
                      >
                        {processing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Finalizar Venda
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Venda */}
      {showDetalhes && vendaSelecionada && (
        <>
          <div className="modal-backdrop fade show" onClick={() => setShowDetalhes(false)}></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-receipt me-2"></i>
                    Detalhes da Venda #{vendaSelecionada.id}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowDetalhes(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Data:</strong> {new Date(vendaSelecionada.created_at).toLocaleString('pt-BR')}
                    </div>
                    <div className="col-md-6">
                      <strong>Total:</strong> <span className="text-success">{vendaSelecionada.total_formatado}</span>
                    </div>
                  </div>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Cliente:</strong> {vendaSelecionada.cliente?.nome || 'Venda avulsa'}
                    </div>
                    <div className="col-md-6">
                      <strong>Pagamento:</strong> {vendaSelecionada.forma_pagamento}
                    </div>
                  </div>

                  <h6>Itens da Venda:</h6>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Produto</th>
                          <th>Qtd</th>
                          <th>Preço Unit.</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendaSelecionada.itens.map((item, index) => (
                          <tr key={index}>
                            <td>{item.produto.nome}</td>
                            <td>{item.quantidade}</td>
                            <td>R$ {Number(item.preco_unitario).toFixed(2).replace('.', ',')}</td>
                            <td>R$ {Number(item.subtotal).toFixed(2).replace('.', ',')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {vendaSelecionada.observacoes && (
                    <div className="mt-3">
                      <strong>Observações:</strong>
                      <p className="text-muted">{vendaSelecionada.observacoes}</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowDetalhes(false)}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de cadastro de cliente */}
      {showClienteModal && (
        <ClienteCreateModal
          show={showClienteModal}
          onClose={() => setShowClienteModal(false)}
          onSuccess={(novoCliente: Cliente) => { // ✅ TIPADO CORRETAMENTE
            setShowClienteModal(false);
            if (novoCliente) {
              setClienteSelecionado(novoCliente);
            }
            // Recarregar lista de clientes
            router.get('/gerenciamento/vendas', {}, { 
              preserveState: true,
              preserveScroll: true 
            });
          }}
        />
      )}
    </GerenciamentoLayout>
  );
}