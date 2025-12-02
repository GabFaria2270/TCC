<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MovimentosEstoqueExport implements FromCollection, WithHeadings, WithMapping, WithColumnWidths, WithStyles
{
    public function __construct(private Collection $movimentos)
    {
    }

    public function collection(): Collection
    {
        return $this->movimentos;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Data',
            'Produto',
            'Tipo',
            'Qtd Anterior',
            'Qtd Movimentada',
            'Qtd Atual',
            'Responsável',
            'Motivo',
        ];
    }

    public function map($movimento): array
    {
        return [
            $movimento->id,
            optional($movimento->created_at)->format('d/m/Y H:i'),
            optional($movimento->produto)->nome ?? '-',
            ucfirst($movimento->tipo),
            $movimento->quantidade_anterior,
            $movimento->quantidade_movimentada,
            $movimento->quantidade_atual,
            optional($movimento->usuario)->NOME ?? '-',
            $movimento->motivo,
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 6,
            'B' => 18,
            'C' => 28,
            'D' => 12,
            'E' => 14,
            'F' => 16,
            'G' => 14,
            'H' => 18,
            'I' => 50,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true],
                'alignment' => ['horizontal' => 'center'],
            ],
        ];
    }
}
