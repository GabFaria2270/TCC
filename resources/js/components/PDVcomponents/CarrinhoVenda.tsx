import React, { useEffect, useState } from 'react';
import type { ItemVenda, Cliente } from '../../types';
import { formatarMoeda } from '../../utils/formatters';
import ClienteCombobox from '@/components/PDVcomponents/ClienteCombobox';

// Primeiro, vou corrigir a interface para aceitar valorRecebido como string
interface CarrinhoVendaProps {
    carrinho: ItemVenda[];
    clienteSelecionado: Cliente | null;
    clientesAtualizados: Cliente[];
    desconto: number;
    formaPagamento: string;
    valorRecebido: string; // ✅ CORRIGIDO: string em vez de number
    observacoes: string;
    loadingVenda: boolean;
    setClienteSelecionado: (cliente: Cliente | null) => void;
    setDesconto: (desconto: number) => void;
    setFormaPagamento: (forma: string) => void;
    setValorRecebido: (valor: string) => void; // ✅ CORRIGIDO: string em vez de number
    setObservacoes: (obs: string) => void;
    editarQuantidade: (produtoId: number, novaQuantidade: number, onNotification?: (notification: any) => void) => void;
    removerDoCarrinho: (produtoId: number, onNotification?: (notification: any) => void) => void;
    limparCarrinho: () => void;
    calcularSubtotal: () => number;
    calcularTotal: () => number;
    finalizarVenda: () => void;
    abrirModalCliente: () => void;
    addNotification: (notification: any) => void;
}

export default function CarrinhoVenda(props: any) {
    const {
        carrinho,
        clientesAtualizados,
        clienteSelecionado,
        setClienteSelecionado,
        formaPagamento,
        setFormaPagamento,
        abrirModalCliente,
        desconto,
        valorRecebido,
        loadingVenda,
        setDesconto,
        setValorRecebido,
        editarQuantidade,
        removerDoCarrinho,
        limparCarrinho,
        calcularSubtotal,
        calcularTotal,
        finalizarVenda,
        addNotification,
    } = props;
    
    // ✅ estado de texto do combobox (campo de busca/seleção)
    const [clienteQuery, setClienteQuery] = useState<string>('');

    // ✅ Sincroniza o texto do combobox quando o cliente selecionado muda externamente (ex: após criar cliente)
    useEffect(() => {
        if (clienteSelecionado) {
            const lbl = clienteSelecionado.email
                ? `${clienteSelecionado.nome} - ${clienteSelecionado.email}`
                : clienteSelecionado.nome;
            setClienteQuery(lbl);
        } else {
            setClienteQuery('');
        }
    }, [clienteSelecionado]);

    // Adicionar função para converter moeda formatada para número
    const converterMoedaParaNumero = (valorFormatado: string): number => {
        if (!valorFormatado || valorFormatado === '') return 0;
        
        // Remove "R$", espaços, pontos de milhares e converte vírgula para ponto
        const numeroLimpo = valorFormatado
            .replace(/R\$\s?/g, '')
            .replace(/\./g, '')
            .replace(',', '.');
        
        const numero = parseFloat(numeroLimpo);
        return isNaN(numero) ? 0 : numero; // ✅ Evita NaN
    };

    // Adicionar função para calcular o troco
    const calcularTroco = (): number => {
        const valorRecebidoNumero = converterMoedaParaNumero(valorRecebido);
        const totalVenda = calcularTotal();
        
        if (valorRecebidoNumero > totalVenda) {
            return valorRecebidoNumero - totalVenda;
        }
        return 0;
    };

    // Corrigir a função handleValorRecebidoChange
    const handleValorRecebidoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        
        // Se o campo estiver vazio ou for apenas "0", limpar
        if (valor === '' || valor === '0') {
            setValorRecebido('');
            return;
        }
        
        // Aplicar formatação de moeda
        const valorFormatado = formatarMoeda(valor);
        setValorRecebido(valorFormatado);
    };

    return (
            <div className={`card carrinho-container h-100 ${loadingVenda ? 'loading' : ''}`}>
                <div className="card-header carrinho-header text-white">
                    <h5 className="mb-0">
                        <i className="bi bi-cart me-2"></i>
                        Carrinho ({carrinho.length} {carrinho.length === 1 ? 'item' : 'itens'})
                    </h5>
                </div>
                <div className="card-body d-flex flex-column">
                    {/* Itens do Carrinho */}
                    <div className="carrinho-lista mb-3 flex-grow-1">
                        {carrinho.length === 0 ? (
                            <div className="estado-vazio">
                                <i className="bi bi-cart-x display-6 d-block mb-2"></i>
                                Carrinho vazio
                            </div>
                        ) : (
                            carrinho.map((item: ItemVenda) => (
                                <div key={item.produto_id} className="card carrinho-item mb-2">
                                    <div className="card-body p-2">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <small className="produto-nome me-2 flex-grow-1">{item.produto.nome}</small>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => removerDoCarrinho(item.produto_id, addNotification)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>

                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="input-group quantidade-controles w-auto">
                                                    <button
                                                        className="btn btn-outline-secondary btn-sm"
                                                        onClick={() => editarQuantidade(item.produto.id, Math.max(1, item.quantidade - 1), addNotification)}
                                                        type="button"
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm text-center px-0"
                                                        style={{ maxWidth: '48px' }}
                                                        value={item.quantidade}
                                                        onChange={(e) => editarQuantidade(item.produto.id, parseInt(e.target.value) || 1, addNotification)}
                                                        min="1"
                                                    />
                                                    <button
                                                        className="btn btn-outline-secondary btn-sm"
                                                        onClick={() => editarQuantidade(item.produto.id, item.quantidade + 1, addNotification)}
                                                        type="button"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                            <div className="text-end">
                                                <small className="preco-info d-block">
                                                    R$ {item.preco_unitario.toFixed(2).replace('.', ',')} × {item.quantidade}
                                                </small>
                                                <strong className="subtotal">R$ {item.subtotal.toFixed(2).replace('.', ',')}</strong>
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
                                            <div className="col-md-3 col-6">
                                                <input
                                                    type="radio"
                                                    className="btn-check"
                                                    name="formaPagamento"
                                                    id="dinheiro"
                                                    value="dinheiro"
                                                    checked={formaPagamento === 'dinheiro'}
                                                    onChange={(e) => setFormaPagamento(e.target.value)}
                                                />
                                                <label
                                                    className="btn btn-outline-primary d-flex flex-column align-items-center w-100 py-3"
                                                    htmlFor="dinheiro"
                                                >
                                                    <i className="bi bi-cash-coin fs-4 mb-2"></i>
                                                    <span className="small">Dinheiro</span>
                                                </label>
                                            </div>

                                            <div className="col-md-3 col-6">
                                                <input
                                                    type="radio"
                                                    className="btn-check"
                                                    name="formaPagamento"
                                                    id="pix"
                                                    value="pix"
                                                    checked={formaPagamento === 'pix'}
                                                    onChange={(e) => setFormaPagamento(e.target.value)}
                                                />
                                                <label
                                                    className="btn btn-outline-primary d-flex flex-column align-items-center w-100 py-3"
                                                    htmlFor="pix"
                                                >
                                                    <i className="bi bi-qr-code fs-4 mb-2"></i>
                                                    <span className="small">PIX</span>
                                                </label>
                                            </div>

                                            <div className="col-md-3 col-6">
                                                <input
                                                    type="radio"
                                                    className="btn-check"
                                                    name="formaPagamento"
                                                    id="cartao_debito"
                                                    value="cartao_debito"
                                                    checked={formaPagamento === 'cartao_debito'}
                                                    onChange={(e) => setFormaPagamento(e.target.value)}
                                                />
                                                <label
                                                    className="btn btn-outline-primary d-flex flex-column align-items-center w-100 py-3"
                                                    htmlFor="cartao_debito"
                                                >
                                                    <i className="bi bi-credit-card-2-front fs-4 mb-2"></i>
                                                    <span className="small">Débito</span>
                                                </label>
                                            </div>

                                            <div className="col-md-3 col-6">
                                                <input
                                                    type="radio"
                                                    className="btn-check"
                                                    name="formaPagamento"
                                                    id="cartao_credito"
                                                    value="cartao_credito"
                                                    checked={formaPagamento === 'cartao_credito'}
                                                    onChange={(e) => setFormaPagamento(e.target.value)}
                                                />
                                                <label
                                                    className="btn btn-outline-primary d-flex flex-column align-items-center w-100 py-3"
                                                    htmlFor="cartao_credito"
                                                >
                                                    <i className="bi bi-credit-card fs-4 mb-2"></i>
                                                    <span className="small">Crédito</span>
                                                </label>
                                            </div>

                                            <div className="col-md-6 col-12">
                                                <input
                                                    type="radio"
                                                    className="btn-check"
                                                    name="formaPagamento"
                                                    id="conta_fiada"
                                                    value="conta_fiada"
                                                    checked={formaPagamento === 'conta_fiada'}
                                                    onChange={(e) => setFormaPagamento(e.target.value)}
                                                />
                                                <label
                                                    className="btn btn-outline-primary d-flex flex-column align-items-center w-100 py-3"
                                                    htmlFor="conta_fiada"
                                                >
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
                                    <label className="form-label small d-block">Cliente</label>

                                    {/* Campo de seleção com botão + ao lado */}
                                    <div className="row g-2 align-items-end">
                                      <div className="col">
                                        <ClienteCombobox
                                          clientes={clientesAtualizados}
                                          valueId={clienteSelecionado?.id ? String(clienteSelecionado.id) : ''}
                                          query={clienteQuery}
                                          setValueId={(id: string) => {
                                            if (!id) {
                                              setClienteSelecionado(null);
                                              return;
                                            }
                                            const c = clientesAtualizados.find((x: any) => String(x.id) === String(id));
                                            setClienteSelecionado(c || null);
                                          }}
                                          setQuery={setClienteQuery}
                                          label=""
                                          placeholder="Nome ou e-mail do cliente"
                                        />
                                      </div>
                                      <div className="col-auto">
                                        <button
                                          type="button"
                                          className="btn btn-outline-primary"
                                          onClick={abrirModalCliente}
                                          title="Cadastrar novo cliente"
                                        >
                                          <i className="bi bi-plus-lg"></i>
                                        </button>
                                      </div>
                                    </div>

                                    {!clienteSelecionado && (
                                      <div className="alert alert-warning alert-sm mt-2 mb-0">
                                        <i className="bi bi-exclamation-triangle me-1"></i>
                                        <small>Selecione um cliente para venda fiada</small>
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>

                            {/* Valor recebido só para dinheiro */}
                            {formaPagamento === 'dinheiro' && (
                                <div className="row">
                                    <div className="col-12">
                                        <label htmlFor="valor-recebido" className="form-label">
                                            <i className="bi bi-cash-coin me-2"></i>
                                            Valor Recebido
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">R$</span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="valor-recebido"
                                                value={valorRecebido}
                                                onChange={handleValorRecebidoChange}
                                                onFocus={(e) => {
                                                    // Limpar campo se estiver com valor inicial
                                                    if (e.target.value === '0,00' || e.target.value === '0') {
                                                        setValorRecebido(''); // ✅ string vazia em vez de número
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    // Se campo estiver vazio após sair, manter vazio
                                                    if (e.target.value === '' || e.target.value === '0') {
                                                        setValorRecebido(''); // ✅ string vazia em vez de número
                                                    }
                                                }}
                                                placeholder="0,00"
                                                style={{ textAlign: 'right' }} // ✅ Alinhamento à direita
                                            />
                                        </div>
                                        {calcularTroco() > 0 && (
                                            <div className="troco-info mt-2 text-center">
                                                <i className="bi bi-arrow-return-left me-1"></i>
                                                Troco: <strong>R$ {calcularTroco().toFixed(2).replace('.', ',')}</strong>
                                            </div>
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
                                className={`btn btn-finalizar-venda w-100 ${loadingVenda ? 'processing' : ''}`}
                                onClick={finalizarVenda}
                                disabled={loadingVenda || carrinho.length === 0}
                            >
                                {loadingVenda ? (
                                    <>
                                        <div className="spinner-border spinner-border-sm me-2" role="status">
                                            <span className="visually-hidden">Processando...</span>
                                        </div>
                                        <span className="processing-text">
                                            Processando venda
                                            <span className="dots">
                                                <span>.</span>
                                                <span>.</span>
                                                <span>.</span>
                                            </span>
                                        </span>
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
    );
}
