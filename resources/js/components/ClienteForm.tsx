import React, { useEffect, useState } from 'react'; // ✅ Adicionar useState
import { useForm } from '@inertiajs/react';
import { formatarTelefone, formatarMoeda } from '../utils/formatters';
import type { Cliente } from '../pages/gerenciamento/Clientes';

interface ClienteFormProps {
  cliente?: Cliente;
  modo: 'create' | 'edit';
  onClose: () => void;
  onSuccess: (cliente?: Cliente) => void;
  carrinhoItens?: any[]; // ✅ Novo prop para receber itens do carrinho
}

export default function ClienteForm({ cliente, modo, onClose, onSuccess, carrinhoItens = [] }: ClienteFormProps) {
  const { data, setData, post, put, processing, errors, reset } = useForm({
    nome: cliente?.nome || '',
    email: cliente?.email || '',
    telefone: cliente?.telefone_formatado || '',
    saldo_inicial: modo === 'edit' ? String(cliente?.conta_fiada?.saldo ?? '') : '',
    descricao: '',
  });

  // ✅ Estado adicional para loading customizado
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Função para gerar descrição automaticamente baseada nos itens do carrinho
  const gerarDescricaoAutomatica = () => {
    if (!carrinhoItens || carrinhoItens.length === 0) {
      return 'Produtos da compra: venda sem itens';
    }

    const itensDescricao = carrinhoItens.map(item => {
      const precoTotal = (item.quantidade * item.preco_unitario).toFixed(2).replace('.', ',');
      return `${item.produto.nome} (${item.quantidade}x) = R$ ${precoTotal}`;
    }).join(', ');

    return `Produtos da compra: ${itensDescricao}`;
  };

  useEffect(() => {
    if (modo === 'edit' && cliente) {
      setData({
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone_formatado || '',
        saldo_inicial: String(cliente.conta_fiada?.saldo ?? ''),
        descricao: cliente.conta_fiada?.descricao || '',
      });
    } else if (modo === 'create') {
      // ✅ Para criação, gera descrição automaticamente
      const descricaoAutomatica = gerarDescricaoAutomatica();
      reset();
      setData('descricao', descricaoAutomatica);
    }
    // eslint-disable-next-line
  }, [cliente, modo, carrinhoItens]); // ✅ Adicionar carrinhoItens às dependências

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
    setIsLoading(true); // ✅ Ativar loading

    if (modo === 'create') {
      // ✅ Preparar dados sem saldo_inicial para criação
      const dadosParaEnvio = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        descricao: data.descricao,
      };

      // ✅ Fazer requisição direta com fetch para garantir JSON
      fetch('/gerenciamento/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(dadosParaEnvio)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Resposta do servidor:', data);
        
        if (data.success && data.cliente) {
          reset();
          onSuccess(data.cliente);
        } else {
          console.error('Erro na resposta:', data);
          alert(data.message || 'Erro ao criar cliente');
        }
      })
      .catch(error => {
        console.error('Erro na requisição:', error);
        alert('Erro ao criar cliente. Tente novamente.');
      })
      .finally(() => {
        setIsLoading(false); // ✅ Desativar loading
      });

    } else {
      // ✅ Para edição, usar fetch também para consistência
      const dadosParaEnvio: any = {
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
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(dadosParaEnvio)
      })
      .then(response => response.json())
      .then(data => {
        console.log('Resposta da edição:', data);
        
        if (data.success) {
          reset();
          onSuccess(cliente);
        } else {
          console.error('Erro na edição:', data);
          alert(data.message || 'Erro ao editar cliente');
        }
      })
      .catch(error => {
        console.error('Erro na requisição de edição:', error);
        alert('Erro ao editar cliente. Tente novamente.');
      })
      .finally(() => {
        setIsLoading(false); // ✅ Desativar loading
      });
    }
  };

  // ✅ Função para aplicar limite de caracteres no telefone
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove tudo que não é número
    const apenasNumeros = value.replace(/\D/g, '');
    
    // ✅ LIMITE: máximo 11 dígitos (DDD + 9 dígitos)
    if (apenasNumeros.length > 11) {
      return; // Não permite mais caracteres
    }
    
    // Formata o telefone
    const telefoneFormatado = formatarTelefone(value);
    setData('telefone', telefoneFormatado);
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
                      type="text"
                      className={`form-control ${errors.telefone ? 'is-invalid' : ''}`}
                      value={data.telefone}
                      onChange={handleTelefoneChange}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      disabled={processing || isLoading} // ✅ Desabilitar durante loading
                    />
                    {errors.telefone && <div className="invalid-feedback">{errors.telefone}</div>}
                  </div>
                  {/* ✅ REMOVIDO: Campo saldo inicial para modo create */}
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
                      {errors.saldo_inicial && (
                        <div className="invalid-feedback d-block">
                          {errors.saldo_inicial}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* ✅ Campo descrição sempre presente, mas readonly para create */}
                <div className="row">
                  <div className="col-12">
                    <label htmlFor="descricao" className="form-label">
                      {modo === 'create' ? 'Descrição da Compra' : 'Descrição da Conta (opcional)'}
                    </label>
                    <textarea
                      className={`form-control ${errors.descricao ? 'is-invalid' : ''}`}
                      id="descricao"
                      rows={3}
                      value={data.descricao}
                      onChange={(e) => modo === 'edit' ? setData('descricao', e.target.value) : null}
                      placeholder={modo === 'create' ? 'Descrição gerada automaticamente com base nos produtos' : 'Ex: Compras do mês, Produtos diversos, etc...'}
                      maxLength={500}
                      readOnly={modo === 'create'}
                      disabled={processing || isLoading} // ✅ Desabilitar durante loading
                      style={modo === 'create' ? { backgroundColor: '#f8f9fa' } : {}}
                    />
                    <div className="form-text">
                      <small className="text-muted">
                        {modo === 'create' 
                          ? 'Esta descrição foi gerada automaticamente com base nos produtos do carrinho'
                          : 'Descreva o que foi comprado ou o motivo do saldo inicial.'}
                      </small>
                    </div>
                    {errors.descricao && (
                      <div className="invalid-feedback d-block">
                        {errors.descricao}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { reset(); onClose(); }}
                  disabled={processing || isLoading} // ✅ Desabilitar durante loading
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={processing || isLoading} // ✅ Desabilitar durante loading
                >
                  {(processing || isLoading) ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {modo === 'create' ? 'Criando...' : 'Atualizando...'}
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