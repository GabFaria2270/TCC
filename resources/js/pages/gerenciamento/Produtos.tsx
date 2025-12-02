import { Head } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import ModalPortal from '@/components/common/ModalPortal';
import ProdutoFormModal from '@/components/Produtos/ProdutoFormModal';
import ProdutosFilters from '@/components/Produtos/ProdutosFilters';
import ProdutosListSection, { ProdutosSortField as SortField } from '@/components/Produtos/ProdutosListSection';
import GerenciamentoLayout from '@/layouts/GerenciamentoLayout';
import useMediaQuery from '@/hooks/useMediaQuery';
import { useProdutoDeleteModal } from '@/hooks/produtos/useProdutoDeleteModal';
import { useProdutoFormModal } from '@/hooks/produtos/useProdutoFormModal';
import { useProdutoStockModal } from '@/hooks/produtos/useProdutoStockModal';
import { useProdutosFilters } from '@/hooks/produtos/useProdutosFilters';
import type { Categoria, Produto, Paginacao, ServerFilters } from '@/types/gerenciamento/Produtos';
import { hideFiltersInUrl, isPaginated } from '@/utils/produtos';

interface Props {
    produtos?: Paginacao<Produto> | Produto[];
    categorias?: Categoria[];
    error?: string;
    filters?: ServerFilters;
}

export default function Produtos({ produtos = [], categorias = [], error, filters }: Props) {
    const h1Ref = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        h1Ref.current?.focus();
        hideFiltersInUrl();
    }, []);

    const isDesktop = useMediaQuery('(min-width: 768px)');

    const {
        searchTerm,
        setSearchTerm,
        categoriaFiltro,
        handleCategoriaChange,
        perPage,
        handlePerPageChange,
        onlyLow,
        handleToggleOnlyLow,
        produtosArray,
        produtosOrdenados,
        sortBy,
        sortDir,
        toggleSort,
        onSearchKeyDown,
        onSearchBlur,
        navegarComFiltros,
        handleRefresh,
        handleClearFilters,
        loading,
    } = useProdutosFilters({ produtos, filters });

    const {
        showModal,
        modalMode,
        produtoSelecionado,
        setProdutoSelecionado,
        data,
        errors,
        processing,
        abrirModalCriar,
        abrirModalEditar,
        fecharModal,
        submit,
        setFormField,
    } = useProdutoFormModal();

    const {
        showStockModal,
        stockMode,
        estoqueQuantidade,
        estoqueNovoSaldo,
        estoqueMotivo,
        setStockMode,
        setEstoqueQuantidade,
        setEstoqueNovoSaldo,
        setEstoqueMotivo,
        abrirModalEstoque,
        fecharModalEstoque,
        submitMovimentoEstoque,
    } = useProdutoStockModal({ produtoSelecionado, setProdutoSelecionado });

    const { showDeleteConfirm, solicitarExclusaoProduto, fecharDeleteModal, confirmarExclusao } = useProdutoDeleteModal({
        produtoSelecionado,
        setProdutoSelecionado,
    });

    const renderSortIcon = (field: SortField) => {
        if (sortBy !== field) return <i className="bi bi-arrow-down-up text-muted ms-1" />;
        return sortDir === 'asc' ? <i className="bi bi-caret-up-fill ms-1" /> : <i className="bi bi-caret-down-fill ms-1" />;
    };

    const abrirAjusteAPartirDoEditar = () => {
        if (!produtoSelecionado) return;
        const produtoAtual = produtoSelecionado;
        fecharModal();
        setTimeout(() => abrirModalEstoque(produtoAtual, 'ajuste'), 120);
    };

    return (
        <GerenciamentoLayout title="Produtos">
            <Head title="Produtos" />
            <h2 className="visually-hidden" ref={h1Ref} tabIndex={-1}>
                Produtos
            </h2>

            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center rounded-3 bg-body-tertiary elemento-produtos-1 mb-4 flex-wrap gap-3 border p-3">
                    <div>
                        <h1 className="h3 m-0">Gestão de Produtos</h1>
                        <p className="text-secondary mb-0">Cadastre e acompanhe os itens da sua mercearia.</p>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary" onClick={handleRefresh} disabled={loading}>
                            {loading ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            ) : (
                                <i className="bi bi-arrow-clockwise" />
                            )}{' '}
                            Atualizar
                        </button>
                        <button className="btn btn-primary elemento-produtos-3" onClick={abrirModalCriar}>
                            <i className="bi bi-plus-lg" /> Novo produto
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2" />
                        {error}
                    </div>
                )}

                <ProdutosFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSearchKeyDown={onSearchKeyDown}
                    onSearchBlur={onSearchBlur}
                    categorias={categorias}
                    categoriaFiltro={categoriaFiltro}
                    onCategoriaChange={handleCategoriaChange}
                    perPage={perPage}
                    onPerPageChange={handlePerPageChange}
                    onlyLow={onlyLow}
                    onToggleOnlyLow={handleToggleOnlyLow}
                    onClearFilters={handleClearFilters}
                />

                <ProdutosListSection
                    isDesktop={isDesktop}
                    produtosArray={produtosArray}
                    produtosOrdenados={produtosOrdenados}
                    onSort={toggleSort}
                    renderSortIcon={renderSortIcon}
                    onCreate={abrirModalCriar}
                    onEdit={abrirModalEditar}
                    onMoveStock={abrirModalEstoque}
                    onDelete={solicitarExclusaoProduto}
                />

                {isPaginated(produtos) && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="small text-secondary">
                            Mostrando {produtos.data.length} de {produtos.total} itens
                        </div>
                        <div className="btn-group" role="group" aria-label="Paginação">
                            <button
                                className="btn btn-outline-secondary"
                                disabled={produtos.current_page <= 1}
                                onClick={() => navegarComFiltros({ page: produtos.current_page - 1 })}
                            >
                                « Anterior
                            </button>
                            <span className="btn btn-outline-secondary disabled">
                                Página {produtos.current_page} de {produtos.last_page}
                            </span>
                            <button
                                className="btn btn-outline-secondary"
                                disabled={produtos.current_page >= produtos.last_page}
                                onClick={() => navegarComFiltros({ page: produtos.current_page + 1 })}
                            >
                                Próxima »
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ProdutoFormModal
                show={showModal}
                mode={modalMode}
                categorias={categorias}
                data={data}
                errors={errors}
                processing={processing}
                produtoSelecionado={produtoSelecionado}
                onClose={fecharModal}
                onSubmit={submit}
                setData={setFormField}
                onOpenAjuste={abrirAjusteAPartirDoEditar}
            />

            {showDeleteConfirm && produtoSelecionado && (
                <ModalPortal>
                    <div className="modal-backdrop fade show" onClick={fecharDeleteModal}></div>
                    <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header border-0">
                                    <h5 className="modal-title">Remover produto</h5>
                                    <button type="button" className="btn-close" aria-label="Fechar" onClick={fecharDeleteModal} />
                                </div>
                                <div className="modal-body">
                                    Tem certeza que deseja remover o produto "{produtoSelecionado.nome}"? Esta ação não pode ser desfeita.
                                </div>
                                <div className="modal-footer d-flex justify-content-between border-0">
                                    <button type="button" className="btn btn-outline-secondary" onClick={fecharDeleteModal}>
                                        Cancelar
                                    </button>
                                    <button type="button" className="btn btn-danger" onClick={confirmarExclusao}>
                                        Remover
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {showStockModal && produtoSelecionado && (
                <ModalPortal>
                    <div className="modal-backdrop fade show" onClick={fecharModalEstoque}></div>
                    <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header border-0">
                                    <h5 className="modal-title">
                                        {stockMode === 'entrada' && 'Entrada de estoque'}
                                        {stockMode === 'saida' && 'Saída de estoque'}
                                        {stockMode === 'ajuste' && 'Ajustar estoque'}
                                    </h5>
                                    <button type="button" className="btn-close" aria-label="Fechar" onClick={fecharModalEstoque} />
                                </div>
                                <form onSubmit={submitMovimentoEstoque}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label htmlFor="mov-tipo" className="form-label">
                                                Tipo de movimento
                                            </label>
                                            <select
                                                id="mov-tipo"
                                                className="form-select"
                                                value={stockMode}
                                                onChange={(e) => setStockMode(e.target.value as 'entrada' | 'saida' | 'ajuste')}
                                            >
                                                <option value="entrada">Entrada</option>
                                                <option value="saida">Saída</option>
                                                <option value="ajuste">Ajuste</option>
                                            </select>
                                        </div>

                                        {stockMode === 'ajuste' ? (
                                            <div className="mb-3">
                                                <label htmlFor="ajuste-novo-saldo" className="form-label">
                                                    Novo estoque
                                                </label>
                                                <input
                                                    id="ajuste-novo-saldo"
                                                    type="number"
                                                    min={0}
                                                    step={1}
                                                    className="form-control"
                                                    value={estoqueNovoSaldo}
                                                    onChange={(e) => setEstoqueNovoSaldo(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        ) : (
                                            <div className="mb-3">
                                                <label htmlFor="mov-quantidade" className="form-label">
                                                    Quantidade*
                                                </label>
                                                <input
                                                    id="mov-quantidade"
                                                    type="number"
                                                    min={1}
                                                    step={1}
                                                    className="form-control"
                                                    value={estoqueQuantidade}
                                                    onChange={(e) => setEstoqueQuantidade(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        )}
                                        <div className="mb-3">
                                            <label htmlFor="mov-motivo" className="form-label">
                                                Motivo (opcional)
                                            </label>
                                            <input
                                                id="mov-motivo"
                                                type="text"
                                                className="form-control"
                                                value={estoqueMotivo}
                                                onChange={(e) => setEstoqueMotivo(e.target.value)}
                                                maxLength={255}
                                            />
                                        </div>
                                    </div>
                                    <div className="modal-footer d-flex justify-content-between border-0">
                                        <button type="button" className="btn btn-outline-secondary" onClick={fecharModalEstoque}>
                                            Cancelar
                                        </button>
                                        <button type="submit" className="btn btn-primary" disabled={processing}>
                                            Confirmar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </GerenciamentoLayout>
    );
}
