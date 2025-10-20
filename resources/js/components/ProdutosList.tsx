import React from 'react';
import type { Produto } from '../types';

interface ProdutosListProps {
    busca: string;
    setBusca: (busca: string) => void;
    produtosFiltrados: Produto[];
    limparBusca: () => void;
    adicionarAoCarrinho: (produto: Produto, onNotification?: (notification: any) => void) => void;
    addNotification: (notification: any) => void;
}

export default function ProdutosList({
    busca,
    setBusca,
    produtosFiltrados,
    limparBusca,
    adicionarAoCarrinho,
    addNotification,
}: ProdutosListProps) {
    return (
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
                                <button className="btn btn-outline-secondary" onClick={limparBusca}>
                                    <i className="bi bi-x"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Lista de Produtos */}
                    <div className="carrinho-lista">
                        <div className="row g-2">
                            {produtosFiltrados.length === 0 ? (
                                <div className="estado-vazio col-12">
                                    <i className="bi bi-search display-4 d-block mb-2"></i>
                                    {busca ? 'Nenhum produto encontrado' : 'Digite para buscar produtos'}
                                </div>
                            ) : (
                                produtosFiltrados.map((produto) => (
                                    <div key={produto.id} className="col-md-6 col-lg-4">
                                        <div className="card produto-card h-100" onClick={() => adicionarAoCarrinho(produto, addNotification)}>
                                            <div className="card-body p-3">
                                                <h6 className="card-title text-truncate mb-2">{produto.nome}</h6>
                                                <p className="card-text small text-muted mb-2">
                                                    {produto.categoria?.nome || 'Sem categoria'}
                                                </p>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <strong className="text-success">{produto.preco_formatado}</strong>
                                                    <small
                                                        className={`badge ${
                                                            (Number(produto.estoque?.quantidade) || 0) > 5
                                                                ? 'bg-success'
                                                                : (Number(produto.estoque?.quantidade) || 0) > 0
                                                                  ? 'bg-warning'
                                                                  : 'bg-danger'
                                                        }`}
                                                    >
                                                        Est: {Number(produto.estoque?.quantidade) || 0}
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
    );
}
