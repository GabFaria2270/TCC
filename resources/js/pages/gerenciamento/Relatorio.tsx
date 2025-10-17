import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';

export default function Relatorio() {
	const h1Ref = useRef<HTMLHeadingElement>(null);
	const [filtroDataInicio, setFiltroDataInicio] = useState('');
	const [filtroDataFim, setFiltroDataFim] = useState('');
	const [filtroTipo, setFiltroTipo] = useState('');
	const [loading, setLoading] = useState(false);
	const [resultados, setResultados] = useState<any[]>([]);
	const [erro, setErro] = useState<string | null>(null);

	useEffect(() => {
		h1Ref.current?.focus();
	}, []);

	// Simulação de busca (substitua por chamada real depois)
	const buscarRelatorio = () => {
		setLoading(true);
		setErro(null);
		setTimeout(() => {
			setResultados([
				{ id: 1, descricao: 'Venda 001', valor: 120.5, data: '2025-10-10', tipo: 'Venda' },
				{ id: 2, descricao: 'Venda 002', valor: 80.0, data: '2025-10-11', tipo: 'Venda' },
			]);
			setLoading(false);
		}, 1000);
	};

	const limparFiltros = () => {
		setFiltroDataInicio('');
		setFiltroDataFim('');
		setFiltroTipo('');
		setResultados([]);
		setErro(null);
	};

	const exportarExcel = () => {
		// Cria um link temporário para download sem sair da aba
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

			<div className="container-fluid">
				<div className="d-flex justify-content-between align-items-center rounded-3 bg-body-tertiary mb-4 flex-wrap gap-3 border p-3 elemento-relatorio-1">
					<div className="elemento-relatorio-2">
						<h1 className="h3 m-0">Relatórios</h1>
						<p className="text-secondary mb-0">Gere relatórios de vendas, estoque e mais.</p>
					</div>
					<div className="elemento-relatorio-3">
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
					<table className="table-hover table-striped data-table mb-0 table align-middle elemento-relatorio-4">
							<thead>
								<tr>
									<th>ID</th>
									<th>Descrição</th>
									<th>Tipo</th>
									<th>Valor</th>
									<th>Data</th>
								</tr>
							</thead>
							<tbody>
								{erro && (
									<tr>
										<td colSpan={5} className="text-danger text-center">{erro}</td>
									</tr>
								)}
								{!erro && resultados.length === 0 && !loading && (
									<tr>
										<td colSpan={5} className="estado-vazio">
											<i className="bi bi-clipboard-data display-6 d-block mb-2"></i>
											Nenhum resultado encontrado.
										</td>
									</tr>
								)}
								{!erro && resultados.map((item) => (
									<tr key={item.id}>
										<td>{item.id}</td>
										<td>{item.descricao}</td>
										<td>{item.tipo}</td>
										<td>R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
										<td>{item.data}</td>
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
