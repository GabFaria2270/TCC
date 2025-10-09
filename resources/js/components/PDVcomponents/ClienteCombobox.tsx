import React, { useEffect, useMemo, useRef, useState } from 'react';

type Cliente = { id: number; nome: string; email?: string | null };

function normalizar(s?: string | null) {
  return s ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
}

export default function ClienteCombobox({
  clientes,
  valueId,              // filtroCliente (id selecionado)
  query,                // filtroClienteTexto (texto digitado)
  setValueId,           // setFiltroCliente
  setQuery,             // setFiltroClienteTexto
  placeholder = 'Buscar cliente por nome ou e-mail...',
  label = 'Cliente',
}: {
  clientes: Cliente[];
  valueId: string;
  query: string;
  setValueId: (v: string) => void;
  setQuery: (v: string) => void;
  placeholder?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const options = useMemo(() => {
    const q = normalizar(query);
    const arr = q
      ? clientes.filter(
          (c) => normalizar(c.nome).includes(q) || normalizar(c.email || '').includes(q),
        )
      : clientes;
    return arr.slice(0, 12); // limita a 12 resultados
  }, [clientes, query]);

  const labelFor = (c: Cliente) => (c.email ? `${c.nome} - ${c.email}` : c.nome);

  const selectByIndex = (idx: number) => {
    const opt = options[idx];
    if (!opt) return;
    setValueId(String(opt.id));
    setQuery(labelFor(opt));
    setOpen(false);
  };

  const clearSelectionIfTextCleared = (text: string) => {
    if (!text) setValueId('');
  };

  
  useEffect(() => {
    if (valueId) {
      const found = clientes.find((c) => String(c.id) === String(valueId));
      if (found) {
        const lbl = labelFor(found);
        if (query !== lbl) setQuery(lbl);
      }
    } else {
  
      if (query !== '') setQuery('');
    }
    
  }, [valueId, clientes]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div className="mb-0" ref={wrapRef} style={{ position: 'relative' }}>
      <label className="form-label">{label}</label>
      <div className="position-relative">
        <input
          ref={inputRef}
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            clearSelectionIfTextCleared(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
              setHighlight((h) => Math.min(h + 1, Math.max(0, options.length - 1)));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              if (!open) setOpen(true);
              else selectByIndex(highlight);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          aria-expanded={open}
          aria-controls="clientes-combobox-menu"
          autoComplete="off"
        />
        {open && (
          <div
            id="clientes-combobox-menu"
            className="dropdown-menu show w-100"
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.25rem)', // ✅ sempre abaixo do input
              left: 0,
              right: 0,
              maxHeight: 260,
              overflowY: 'auto',
              zIndex: 1080, // acima do card
            }}
          >
            {options.length === 0 ? (
              <div className="dropdown-item text-muted">Nenhum cliente encontrado</div>
            ) : (
              options.map((c, idx) => (
                <button
                  type="button"
                  key={c.id}
                  className={`dropdown-item d-flex justify-content-between align-items-center ${idx === highlight ? 'active' : ''}`}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => selectByIndex(idx)}
                >
                  <span>{c.nome}</span>
                  {c.email && <small className="text-muted ms-2">{c.email}</small>}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}