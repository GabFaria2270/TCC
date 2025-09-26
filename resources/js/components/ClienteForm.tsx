import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { formatarTelefone, formatarMoeda } from '../utils/formatters';
import type { Cliente } from '../pages/gerenciamento/Clientes';

interface ClienteFormProps {
  cliente?: Cliente;
  modo: 'create' | 'edit';
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClienteForm({ cliente, modo, onClose, onSuccess }: ClienteFormProps) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    nome: cliente?.nome || '',
    email: cliente?.email || '',
    telefone: cliente?.telefone_formatado || '',
    saldo_inicial: modo === 'edit' ? String(cliente?.conta_fiada?.saldo ?? '') : '',
    descricao: '',
  });

  useEffect(() => {
    if (modo === 'edit' && cliente) {
      setData({
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone_formatado || '',
        saldo_inicial: String(cliente.conta_fiada?.saldo ?? ''),
        descricao: '',
      });
    } else if (modo === 'create') {
      reset();
    }
    // eslint-disable-next-line
  }, [cliente, modo]);

  function normalizarMoeda(valor: string) {
    if (!valor) return '';
    // Remove pontos de milhar (todos os pontos, menos o decimal)
    valor = valor.replace(/\./g, '');
    // Troca vírgula decimal por ponto
    valor = valor.replace(',', '.');
    return valor;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    // Normaliza o saldo antes de enviar
    let saldoNormalizado = '';
    if (modo === 'create' && data.saldo_inicial && data.saldo_inicial.trim() !== '') {
      saldoNormalizado = normalizarMoeda(data.saldo_inicial);
    } else if (modo === 'edit' && data.saldo_inicial && data.saldo_inicial.trim() !== '') {
      saldoNormalizado = normalizarMoeda(data.saldo_inicial);
    }

    // Monta os dados para envio, garantindo saldo normalizado
    const dataToSend = {
      ...data,
      saldo_inicial: saldoNormalizado,
    };

    if (modo === 'create') {
      post('/gerenciamento/clientes', {
        ...dataToSend,
        onSuccess: () => {
          reset();
          onSuccess();
        },
        onError: () => {
          // Não fecha o modal, apenas exibe os erros
        }
      });
    } else if (cliente) {
      put(`/gerenciamento/clientes/${cliente.id}`, {
        ...dataToSend,
        onSuccess: () => {
          reset();
          onSuccess();
        },
        onError: () => {
          // Não fecha o modal, apenas exibe os erros
        }
      });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      {/* Modal */}
      <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {modo === 'create' ? 'Novo Cliente' : 'Editar Cliente'}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Fechar modal"
              ></button>
            </div>
            <form onSubmit={submit}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="nome" className="form-label">Nome *</label>
                    <input
                      id="nome"
                      type="text"
                      className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                      value={data.nome}
                      onChange={(e) => setData('nome', e.target.value)}
                      required
                      autoFocus
                      disabled={processing}
                    />
                    {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">E-mail *</label>
                    <input
                      id="email"
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      required
                      disabled={processing}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="telefone" className="form-label">Telefone</label>
                    <input
                      id="telefone"
                      type="tel"
                      className={`form-control ${errors.telefone ? 'is-invalid' : ''}`}
                      value={data.telefone}
                      onChange={(e) => setData('telefone', formatarTelefone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      disabled={processing}
                    />
                    {errors.telefone && <div className="invalid-feedback">{errors.telefone}</div>}
                  </div>
                  {modo === 'create' && (
                    <div className="col-md-6 mb-3">
                      <label htmlFor="saldo_inicial" className="form-label">
                        Saldo Inicial (opcional)
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
                      {errors.saldo_inicial && (
                        <div className="invalid-feedback d-block">
                          {errors.saldo_inicial}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {modo === 'create' && (
                  <div className="row">
                    <div className="col-12">
                      <label htmlFor="descricao" className="form-label">
                        Descrição da Conta (opcional)
                      </label>
                      <textarea
                        className={`form-control ${errors.descricao ? 'is-invalid' : ''}`}
                        id="descricao"
                        rows={3}
                        value={data.descricao}
                        onChange={(e) => setData('descricao', e.target.value)}
                        placeholder="Ex: Compras do mês, Produtos diversos, etc..."
                        maxLength={500}
                      />
                      <div className="form-text">
                        <small className="text-muted">
                          Descreva o que foi comprado ou o motivo do saldo inicial.
                        </small>
                      </div>
                      {errors.descricao && (
                        <div className="invalid-feedback d-block">
                          {errors.descricao}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { reset(); onClose(); }}
                  disabled={processing}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      {modo === 'create' ? 'Salvar Cliente' : 'Atualizar Cliente'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}