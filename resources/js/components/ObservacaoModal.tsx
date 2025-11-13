import React from 'react';

interface Item {
	produto: string;
	quantidade: number;
	valor_unitario: number;
	valor_unitario_formatado: string;
	subtotal: number;
	subtotal_formatado: string;
}

interface ObservacaoModalProps {
	show: boolean;
	onClose: () => void;
	texto: string;
	itens: Item[];
}

const ObservacaoModal: React.FC<ObservacaoModalProps> = ({ show, onClose, texto, itens }) => {
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
												<td>{item.valor_unitario_formatado}</td>
												<td>{item.subtotal_formatado}</td>
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
};

export default ObservacaoModal;
