import { statusInfo } from '@/utils/relatorios';

export default function StatusBadge({ status }: { status: string }) {
    const info = statusInfo(status);
    return <span className={`badge ${info.badgeClass}`}>{info.label}</span>;
}
