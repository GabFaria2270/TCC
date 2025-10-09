import React, { useEffect, useState } from 'react';
import { formatarMoeda, formatarTelefone } from '../../utils/formatters';
import ModalPortal from '../common/ModalPortal';
import { useInertiaPut } from '../useInertiaPut';

interface ClienteEditModalProps {
    show: boolean;
    cliente: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ClienteEditModal({ show, cliente, onClose, onSuccess }: ClienteEditModalProps) {
    const [form, setForm] = useState({
        nome: '',
        email: '',
        telefone: '',
        descricao: '',
        saldo_inicial: '',
    });
    const [loading, setLoading] = useState(false);
    const inertiaPut = useInertiaPut();

    // Preenche os campos ao abrir o modal
    useEffect(() => {
        if (show && cliente) {
            setForm({
                nome: cliente.nome || '',
                email: cliente.email || '',
                telefone: cliente.telefone_formatado || cliente.telefone || '',
                descricao: typeof cliente.conta_fiada?.descricao === 'string' ? cliente.conta_fiada.descricao : '',
                saldo_inicial:
                    cliente.conta_fiada && cliente.conta_fiada.saldo !== undefined && cliente.conta_fiada.saldo !== null
                        ? formatarMoeda(String(cliente.conta_fiada.saldo))
                        : '0,00',
            });
        } else if (show && !cliente) {
            // Cadastro novo
            setForm({
                nome: '',
                email: '',
                telefone: '',
                descricao: '',
                saldo_inicial: '0,00',
            });
        }
    }, [show, cliente]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;

        if (id === 'saldo_inicial') {
            setForm({ ...form, [id]: formatarMoeda(value) });
        } else if (id === 'telefone') {
            // ✅ Aplicar limite de telefone
            const apenasNumeros = value.replace(/\D/g, '');

            // LIMITE: máximo 11 dígitos
            if (apenasNumeros.length > 11) {
                return; // Não permite mais caracteres
            }

            setForm({ ...form, [id]: formatarTelefone(value) });
        } else {
            setForm({ ...form, [id]: value });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        inertiaPut(`/gerenciamento/clientes/${cliente.id}`, form, {
            onSuccess: () => {
                setLoading(false);
                onSuccess();
            },
            onError: () => {
                setLoading(false);
            },
        });
    };

    return !show ? null : (
        <ModalPortal>
            <div className="modal-backdrop fade show" onClick={onClose}></div>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Editar Cliente</h5>
                            <button type="button" className="btn-close" onClick={onClose} aria-label="Fechar modal"></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="nome" className="form-label">
                                            Nome *
                                        </label>
                                        <input
                                            id="nome"
                                            className="form-control"
                                            required
                                            type="text"
                                            value={form.nome}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="email" className="form-label">
                                            E-mail *
                                        </label>
                                        <input
                                            id="email"
                                            className="form-control"
                                            required
                                            type="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="telefone" className="form-label">
                                            Telefone
                                            <small className="text-muted ms-1">(máx. 11 dígitos)</small>
                                        </label>
                                        <input
                                            id="telefone"
                                            className="form-control"
                                            placeholder="(00) 00000-0000"
                                            type="tel"
                                            value={form.telefone}
                                            onChange={handleChange}
                                            maxLength={15} // ✅ Limite de caracteres formatados
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="col-md-6 campo-saldo mb-3">
                                        <label htmlFor="saldo_inicial" className="form-label">
                                            Saldo da Conta Fiada
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">R$</span>
                                            <input
                                                id="saldo_inicial"
                                                className="form-control"
                                                type="text"
                                                value={form.saldo_inicial}
                                                onChange={handleChange}
                                                placeholder="0,00"
                                                inputMode="numeric"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
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
                                            value={form.descricao}
                                            onChange={handleChange}
                                            placeholder="Ex: Compras do mês, Produtos diversos, etc..."
                                            maxLength={500}
                                            disabled={loading}
                                        />
                                        <small className="form-text text-muted">Descreva o que foi comprado ou o motivo do saldo inicial.</small>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    ) : (
                                        <i className="bi bi-check-lg me-2"></i>
                                    )}
                                    Atualizar Cliente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
