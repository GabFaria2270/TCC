import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';

function ObservacaoModal({ show, onClose, texto, itens }: { show: boolean; onClose: () => void; texto: string; itens: any[] }) {
	if (!show) return null;
	return (
		<div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
			<div className="modal-dialog modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">Observação Completa</h5>
						<button type="button" className="btn-close" aria-label="Fechar" onClick={onClose}></button>
					</div>
					<div className="modal-body">
						<div className="mb-3">
							<strong>Observações</strong>
							<div className="form-control bg-dark text-light" style={{ whiteSpace: 'pre-line', wordBreak: 'break-word' }}>{texto}</div>
						</div>
						{itens && itens.length > 0 && (
							<div>
								<table className="table table-dark table-striped table-bordered">
									<thead>
										<tr>
											<th>Produto</th>
											<th>Qtd</th>
											<th>Unit.</th>
											<th>Subtotal</th>
										</tr>
									</thead>
									<tbody>
										{itens.map((item, idx) => (
											<tr key={idx}>
												<td>{item.produto}</td>
												<td>{item.quantidade}</td>
												<td>R$ {item.valor_unitario}</td>
												<td>R$ {item.subtotal}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function Relatorio({ dados = [] }: { dados?: any[] }) {
	const h1Ref = useRef<HTMLHeadingElement>(null);
	const [filtroDataInicio, setFiltroDataInicio] = useState('');
	const [filtroDataFim, setFiltroDataFim] = useState('');
	const [filtroTipo, setFiltroTipo] = useState('');
	const [loading, setLoading] = useState(false);
	const [resultados, setResultados] = useState<any[]>(dados);
	const [erro, setErro] = useState<string | null>(null);
	const [modalObs, setModalObs] = useState<{ show: boolean; texto: string; itens: any[] }>({ show: false, texto: '', itens: [] });

	useEffect(() => {
		h1Ref.current?.focus();
	}, []);

	const buscarRelatorio = () => {
		setLoading(true);
		setErro(null);
		setTimeout(() => {
			setResultados(dados);
			setLoading(false);
		}, 500);
	};

	const limparFiltros = () => {
		setFiltroDataInicio('');
		setFiltroDataFim('');
		setFiltroTipo('');
		setResultados(dados);
		setErro(null);
	};

	const exportarExcel = () => {
		const link = document.createElement('a');
		link.href = '/gerenciamento/relatorio/exportar-excel';
		link.setAttribute('download', 'relatorio_vendas.xlsx');
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<GerenciamentoLayout title="Relatório">
			<Head title="Relatório" />
			<h2 className="visually-hidden" ref={h1Ref} tabIndex={-1}>
				Relatório
			</h2>

			<ObservacaoModal show={modalObs.show} onClose={() => setModalObs({ show: false, texto: '', itens: [] })} texto={modalObs.texto} itens={modalObs.itens} />

			<div className="container-fluid">
				<div className="d-flex justify-content-between align-items-center rounded-3 bg-body-tertiary mb-4 flex-wrap gap-3 border p-3">
					<div>
						<h1 className="h3 m-0">Relatórios</h1>
						<p className="text-secondary mb-0">Gere relatórios de vendas, estoque e mais.</p>
					</div>
					<div>
						<button className="btn btn-success" onClick={exportarExcel} type="button">
							<i className="bi bi-file-earmark-excel me-2" /> Exportar Excel
						</button>
					</div>
				</div>

				{/* Filtros */}
				<div className="card filtros-card fade-in mb-4 border-0 shadow-sm">
					<div className="card-body row g-3">
						<div className="col-md-3 col-12">
							<label htmlFor="filtro-data-inicio" className="form-label">Data início</label>
							<input
								id="filtro-data-inicio"
								type="date"
								className="form-control"
								value={filtroDataInicio}
								onChange={e => setFiltroDataInicio(e.target.value)}
							/>
						</div>
						<div className="col-md-3 col-12">
							<label htmlFor="filtro-data-fim" className="form-label">Data fim</label>
							<input
								id="filtro-data-fim"
								type="date"
								className="form-control"
								value={filtroDataFim}
								onChange={e => setFiltroDataFim(e.target.value)}
							/>
						</div>
						<div className="col-md-3 col-12">
							<label htmlFor="filtro-tipo" className="form-label">Tipo</label>
							<select
								id="filtro-tipo"
								className="form-select"
								value={filtroTipo}
								onChange={e => setFiltroTipo(e.target.value)}
							>
								<option value="">Todos</option>
								<option value="Venda">Venda</option>
								<option value="Estoque">Estoque</option>
							</select>
						</div>
						<div className="col-md-3 col-12 d-flex align-items-end gap-2">
							<button className="btn btn-primary w-100" onClick={buscarRelatorio} disabled={loading}>
								{loading ? (
									<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
								) : (
									<i className="bi bi-search" />
								)} Buscar
							</button>
							<button className="btn btn-outline-secondary w-100" onClick={limparFiltros} disabled={loading}>
								Limpar
							</button>
						</div>
					</div>
				</div>

				{/* Resultados */}
				<div className="card fade-in border-0 shadow-sm">
					<div className="card-header d-flex justify-content-between align-items-center bg-body-tertiary border-0">
						<strong>Resultados</strong>
						<div className="small text-secondary">Exibe os dados conforme filtros selecionados</div>
					</div>
					<div className="table-responsive scroll-shadow">
						<table className="table-hover table-striped data-table mb-0 table align-middle">
							<thead>
								<tr>
									<th>ID</th>
									<th>Data</th>
									<th>Cliente</th>
									<th>Usuário</th>
									<th>Total (R$)</th>
									<th>Desconto (R$)</th>
									<th>Forma de Pagamento</th>
									<th>Status</th>
									<th>Observação Completa</th>
								</tr>
							</thead>
							<tbody>
								{erro && (
									<tr>
										<td colSpan={9} className="text-danger text-center">{erro}</td>
									</tr>
								)}
								{!erro && resultados.length === 0 && !loading && (
									<tr>
										<td colSpan={9} className="estado-vazio">
											<i className="bi bi-clipboard-data display-6 d-block mb-2"></i>
											Nenhum resultado encontrado.
										</td>
									</tr>
								)}
								{!erro && resultados.map((item) => (
									<tr key={item.id}>
										<td>{item.id}</td>
										<td>{item.data}</td>
										<td>{item.cliente}</td>
										<td>{item.usuario}</td>
										<td>{item.total}</td>
										<td>{item.desconto}</td>
										<td>{item.forma_pagamento}</td>
										<td>{item.status}</td>
										<td>
											<button className="btn btn-link p-0" style={{ fontSize: 16 }} onClick={() => setModalObs({ show: true, texto: item.observacoes, itens: item.itens || [] })}>
												<i className="bi bi-eye" title="Ver observação completa"></i>
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</GerenciamentoLayout>
	);
}
