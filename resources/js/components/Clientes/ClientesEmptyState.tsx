import { Link } from '@inertiajs/react';
import { useRoute } from '@/lib/route';

export default function ClientesEmptyState() {
    const { route } = useRoute();
    return (
        <div className="clientes-empty-state elemento-clientes-6">
            <i className="bi bi-people clientes-empty-icon" />
            <h3>Cadastre um cliente durante uma venda</h3>
            <p>Abra sua aba de vendas e crie o cliente no método conta fiada.</p>
            <Link href={route('vendas.index')} className="btn btn-primary">
                <i className="bi bi-cash-register" /> Ir para Vendas
            </Link>
        </div>
    );
}
