import React, { useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import GerenciamentoLayout from '../../layouts/GerenciamentoLayout';

export default function Clientes() {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => { h1Ref.current?.focus(); }, []);

  return (
    <GerenciamentoLayout title="Clientes">
      <h2 className="visually-hidden" ref={h1Ref} tabIndex={-1}>Clientes</h2>

      <div className="card shadow-sm">
        <div className="card-header bg-white"><strong>Clientes</strong></div>
        <div className="card-body">
          <p className="mb-3">Exemplo de página de clientes. Aqui entraremos com a lista e ações.</p>
          <div className="d-flex gap-2">
            <Link className="btn btn-primary" href="#" onClick={(e) => e.preventDefault()}>Novo cliente</Link>
            <Link className="btn btn-outline-secondary" href="#" onClick={(e) => e.preventDefault()}>Importar</Link>
          </div>
        </div>
      </div>
    </GerenciamentoLayout>
  );
}
