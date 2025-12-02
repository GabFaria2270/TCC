import type { ComponentProps } from 'react';
import CarrinhoVenda from '@/components/PDVcomponents/CarrinhoVenda';
import ProdutosList from '@/components/ProdutosList';

interface NovaVendaSectionProps {
    produtosListProps: ComponentProps<typeof ProdutosList>;
    carrinhoProps: ComponentProps<typeof CarrinhoVenda>;
    loadingVenda: boolean;
    cancelandoVenda: boolean;
}

export default function NovaVendaSection({ produtosListProps, carrinhoProps, loadingVenda, cancelandoVenda }: NovaVendaSectionProps) {
    return (
        <div className={`row fade-in vendas-container ${loadingVenda || cancelandoVenda ? 'processing' : ''}`}>
            <div className="col-lg-8 mb-lg-0 col-12 mb-3">
                <ProdutosList {...produtosListProps} />
            </div>
            <div className="col-lg-4 col-12">
                <CarrinhoVenda {...carrinhoProps} />
            </div>
        </div>
    );
}
