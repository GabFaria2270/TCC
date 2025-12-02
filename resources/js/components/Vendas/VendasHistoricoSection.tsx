import type { ComponentProps } from 'react';
import VendasList from '@/components/PDVcomponents/VendasList';

export type VendasHistoricoSectionProps = ComponentProps<typeof VendasList>;

export default function VendasHistoricoSection(props: VendasHistoricoSectionProps) {
    return (
        <div className="elemento-vendas-lista">
            <VendasList {...props} />
        </div>
    );
}
