// Utilitário para exportação de dados para Excel usando a dependência local do SheetJS
import * as XLSX from 'xlsx';

export function exportarParaExcel(dados: any[], nomeArquivo: string = 'relatorio.xlsx') {
    if (!dados || dados.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(dados);
    // Estilização do cabeçalho
    const headerStyle = {
        fill: { fgColor: { rgb: '222222' } },
        font: { color: { rgb: 'FFFFFF' }, bold: true },
        border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
        },
    };
    const cellStyle = {
        border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
        },
    };
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (ws[cell_address]) ws[cell_address].s = headerStyle;
    }
    for (let R = 1; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
            if (ws[cell_address]) ws[cell_address].s = cellStyle;
        }
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');
    XLSX.writeFile(wb, nomeArquivo);
}
