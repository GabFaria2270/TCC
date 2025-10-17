<?php

namespace App\Exports;

use App\Models\Venda;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Maatwebsite\Excel\Events\AfterSheet;

class VendasExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths, WithEvents
{
    public function collection()
    {
        // Você pode adicionar filtros aqui se desejar
        return Venda::with(['cliente', 'usuario'])
            ->orderBy('id', 'asc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Data',
            'Cliente',
            'Usuário',
            'Total (R$)',
            'Desconto (R$)',
            'Forma de Pagamento',
            'Status',
            'Observação Completa',
        ];
    }

    public function map($venda): array
    {
        return [
            $venda->id,
            optional($venda->created_at)->format('d/m/Y H:i'),
            optional($venda->cliente)->nome ?? '-',
            optional($venda->usuario)->NOME ?? '-',
            number_format($venda->total, 2, ',', '.'),
            number_format($venda->desconto, 2, ',', '.'),
            $venda->forma_pagamento,
            $venda->status,
            $venda->observacoes, // Sempre mostra a observação completa
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'size' => 12],
                'alignment' => ['horizontal' => 'center'],
            ],
            // Colunas de valor alinhadas à direita
            'E' => ['alignment' => ['horizontal' => 'right']],
            'F' => ['alignment' => ['horizontal' => 'right']],
            'I' => ['alignment' => ['wrapText' => true]],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 6,
            'B' => 18,
            'C' => 22,
            'D' => 18,
            'E' => 14,
            'F' => 16,
            'G' => 22,
            'H' => 14,
            'I' => 80, // Observação Completa
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $vendas = $this->collection();
                $row = 2;
                $lastRow = $row + count($vendas) - 1;
                $sheet->getStyle("A1:I$lastRow")->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);
                $sheet->getStyle('A1:I1')->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setARGB('FFCCE5FF');
            }
        ];
    }

    public function sheets(): array
    {
        $vendas = $this->collection();
        return [
            'DetalhesObservacoes' => new class($vendas) implements FromCollection, WithHeadings, WithStyles, WithColumnWidths, WithEvents {
                protected $vendas;
                public function __construct($vendas) { $this->vendas = $vendas; }
                public function collection() {
                    return $this->vendas->map(function($venda) {
                        return [
                            $venda->id,
                            optional($venda->created_at)->format('d/m/Y H:i'),
                            optional($venda->cliente)->nome ?? '-',
                            optional($venda->usuario)->NOME ?? '-',
                            $venda->observacoes,
                        ];
                    });
                }
                public function headings(): array {
                    return ['ID', 'Data', 'Cliente', 'Usuário', 'Observação Completa'];
                }
                public function styles(Worksheet $sheet) {
                    return [
                        1 => [
                            'font' => ['bold' => true, 'size' => 12],
                            'alignment' => ['horizontal' => 'center'],
                        ],
                        'E' => ['alignment' => ['wrapText' => true]],
                    ];
                }
                public function columnWidths(): array {
                    return [
                        'A' => 6,
                        'B' => 18,
                        'C' => 22,
                        'D' => 18,
                        'E' => 80,
                    ];
                }
                // Não define altura fixa, mantém ajuste automático do Excel
            },
            'RelatorioVendas' => $this,
        ];
    }
}