import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    title: string;
}

export default function ClienteForm({ title }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nome: '',
        email: '',
        telefone: '',
        saldo_inicial: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('clientes.store'), {
            onFinish: () => reset('nome', 'email', 'telefone', 'saldo_inicial'),
        });
    };

    return (
        <>
            <Head title={title} />
            
            <div className="container mt-4">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow">
                            <div className="card-header">
                                <h4 className="mb-0">{title}</h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={submit}>
                                    <div className="mb-3">
                                        <label htmlFor="nome" className="form-label">Nome *</label>
                                        <input
                                            id="nome"
                                            type="text"
                                            className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                                            value={data.nome}
                                            onChange={(e) => setData('nome', e.target.value)}
                                            required
                                        />
                                        {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">E-mail *</label>
                                        <input
                                            id="email"
                                            type="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                        />
                                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="telefone" className="form-label">Telefone</label>
                                        <input
                                            id="telefone"
                                            type="tel"
                                            className={`form-control ${errors.telefone ? 'is-invalid' : ''}`}
                                            value={data.telefone}
                                            onChange={(e) => setData('telefone', e.target.value)}
                                            placeholder="(00) 00000-0000"
                                        />
                                        {errors.telefone && <div className="invalid-feedback">{errors.telefone}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="saldo_inicial" className="form-label">Saldo Inicial</label>
                                        <input
                                            id="saldo_inicial"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className={`form-control ${errors.saldo_inicial ? 'is-invalid' : ''}`}
                                            value={data.saldo_inicial}
                                            onChange={(e) => setData('saldo_inicial', e.target.value)}
                                            placeholder="0.00"
                                        />
                                        {errors.saldo_inicial && <div className="invalid-feedback">{errors.saldo_inicial}</div>}
                                    </div>

                                    <div className="d-flex justify-content-between">
                                        <a href={route('clientes.index')} className="btn btn-secondary">
                                            Cancelar
                                        </a>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary"
                                            disabled={processing}
                                        >
                                            {processing ? 'Salvando...' : 'Salvar Cliente'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}