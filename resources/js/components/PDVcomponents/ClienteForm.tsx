import { useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import type { Cliente } from '../../pages/gerenciamento/Clientes';
import { formatarMoeda, formatarTelefone } from '../../utils/formatters';

interface ClienteFormProps {
    cliente?: Cliente;
    modo: 'create' | 'edit';
    onClose: () => void;
    onSuccess: (cliente?: Cliente) => void;
    carrinhoItens?: any[];
    embed?: boolean; // Mantido por compatibilidade; este componente não renderiza modal wrapper
}

export default function ClienteForm({ cliente, modo, onClose, onSuccess, carrinhoItens = [], embed = false }: ClienteFormProps) {
    const { data, setData, processing, errors, reset } = useForm({
        nome: cliente?.nome || '',
        email: cliente?.email || '',
        telefone: cliente?.telefone_formatado || cliente?.telefone || '',
        saldo_inicial: modo === 'edit' ? String(cliente?.conta_fiada?.saldo ?? '') : '',
        descricao: '',
    });

    const [isLoading, setIsLoading] = useState(false);

    const gerarDescricaoAutomatica = () => {
        if (!carrinhoItens || carrinhoItens.length === 0) {
            return 'Produtos da compra: venda sem itens';
        }
        const itensDescricao = carrinhoItens
            .map((item) => {
                const precoTotal = (item.quantidade * item.preco_unitario).toFixed(2).replace('.', ',');
                return `${item.produto.nome} (${item.quantidade}x) = R$ ${precoTotal}`;
            })
            .join(', ');
        return `Produtos da compra: ${itensDescricao}`;
    };

    useEffect(() => {
        if (modo === 'edit' && cliente) {
            setData({
                nome: cliente.nome,
                email: cliente.email,
                telefone: cliente.telefone_formatado || cliente.telefone || '',
                saldo_inicial: String(cliente.conta_fiada?.saldo ?? ''),
                descricao: cliente.conta_fiada?.descricao || '',
            });
        } else if (modo === 'create') {
            const descricaoAutomatica = gerarDescricaoAutomatica();
            reset();
            setData('descricao', descricaoAutomatica);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cliente, modo, carrinhoItens]);

    function normalizarMoeda(valor: string) {
        if (!valor) return '';
        let v = valor.replace(/\./g, '');
        v = v.replace(',', '.');
        return v;
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (modo === 'create') {
            const dadosParaEnvio = {
                nome: data.nome,
                email: data.email,
                telefone: data.telefone,
                descricao: data.descricao,
            };

            fetch('/gerenciamento/clientes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(dadosParaEnvio),
            })
                .then((response) => {
                    if (!response.ok) {
                        // Se for erro de validação, pega o JSON
                        return response.json().then((resp) => {
                            if (resp.errors) {
                                Object.keys(resp.errors).forEach((campo) => {
                                    errors[campo as keyof typeof errors] = resp.errors[campo][0];
                                });
                            }
                            setIsLoading(false);
                        });
                    }
                    return response.json();
                })
                .then((resp) => {
                    if (resp && resp.success && resp.cliente) {
                        reset();
                        onSuccess(resp.cliente as Cliente);
                    }
                })
                .catch((error) => {
                    console.error('Erro na requisição:', error);
                    alert('Erro ao criar cliente. Tente novamente.');
                })
                .finally(() => setIsLoading(false));
        } else {
            const dadosParaEnvio: Record<string, any> = {
                nome: data.nome,
                email: data.email,
                telefone: data.telefone,
                descricao: data.descricao,
            };
            if (data.saldo_inicial && data.saldo_inicial.trim() !== '') {
                dadosParaEnvio.saldo_inicial = normalizarMoeda(data.saldo_inicial);
            }

            fetch(`/gerenciamento/clientes/${cliente?.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(dadosParaEnvio),
            })
                .then((response) => response.json())
                .then((resp) => {
                    if (resp.success) {
                        reset();
                        onSuccess(cliente);
                    } else {
                        console.error('Erro na edição:', resp);
                        alert(resp.message || 'Erro ao editar cliente');
                    }
                })
                .catch((error) => {
                    console.error('Erro na requisição de edição:', error);
                    alert('Erro ao editar cliente. Tente novamente.');
                })
                .finally(() => setIsLoading(false));
        }
    };

    const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const apenasNumeros = value.replace(/\D/g, '');
        if (apenasNumeros.length > 11) return;
        const telefoneFormatado = formatarTelefone(value);
        setData('telefone', telefoneFormatado);
    };

    return (
        <form onSubmit={submit}>
            <div className="modal-body">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="nome" className="form-label">
                            Nome *
                        </label>
                        <input
                            id="nome"
                            type="text"
                            className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                            value={data.nome}
                            onChange={(e) => setData('nome', e.target.value)}
                            required
                            autoFocus
                            disabled={processing || isLoading}
                        />
                        {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">
                            E-mail *
                        </label>
                        <input
                            id="email"
                            type="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            disabled={processing || isLoading}
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label htmlFor="telefone" className="form-label">
                            Telefone
                        </label>
                        <input
                            id="telefone"
                            type="text"
                            className={`form-control ${errors.telefone ? 'is-invalid' : ''}`}
                            value={data.telefone}
                            onChange={handleTelefoneChange}
                            placeholder="(11) 99999-9999"
                            maxLength={15}
                            disabled={processing || isLoading}
                        />
                        {errors.telefone && <div className="cliente-form-error">{errors.telefone}</div>}
                    </div>
                    {modo === 'edit' && (
                        <div className="col-md-6 mb-3">
                            <label htmlFor="saldo_inicial" className="form-label">
                                Saldo da Conta Fiada
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">R$</span>
                                <input
                                    type="text"
                                    className={`form-control ${errors.saldo_inicial ? 'is-invalid' : ''}`}
                                    id="saldo_inicial"
                                    value={data.saldo_inicial}
                                    onChange={(e) => setData('saldo_inicial', formatarMoeda(e.target.value))}
                                    placeholder="0,00"
                                />
                            </div>
                            {errors.saldo_inicial && <div className="invalid-feedback d-block">{errors.saldo_inicial}</div>}
                        </div>
                    )}
                </div>

                <div className="row">
                    <div className="col-12 mb-3">
                        <label htmlFor="descricao" className="form-label">
                            Descrição da Conta <span className="text-muted">(opcional)</span>
                        </label>
                        <textarea
                            className="form-control"
                            id="descricao"
                            rows={3}
                            value={data.descricao}
                            onChange={(e) => setData('descricao', e.target.value)}
                            placeholder={
                                modo === 'create'
                                    ? 'Gerado automaticamente com base nos produtos do carrinho (você pode editar)'
                                    : 'Ex: Compras do mês, Produtos diversos, etc...'
                            }
                            maxLength={500}
                            disabled={processing || isLoading}
                            style={{}}
                        />
                        <div className="form-text">
                            <small className="text-muted">
                                {modo === 'create'
                                    ? 'Esta descrição foi gerada automaticamente com base nos produtos do carrinho.'
                                    : 'Descreva o que foi comprado ou o motivo do saldo.'}
                            </small>
                        </div>
                        {errors.descricao && <div className="invalid-feedback d-block">{errors.descricao}</div>}
                    </div>
                </div>
            </div>

            <div className="modal-footer">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                        reset();
                        onClose();
                    }}
                    disabled={processing || isLoading}
                >
                    Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={processing || isLoading}>
                    {processing || isLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {modo === 'create' ? 'Criando...' : 'Atualizando...'}
                        </>
                    ) : (
                        <>
                            <i className="bi bi-check-lg me-2"></i>
                            {modo === 'create' ? 'Salvar Cliente' : 'Salvar Alterações'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
