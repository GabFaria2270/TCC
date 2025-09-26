export function formatarTelefone(valor: string) {
  valor = valor.replace(/\D/g, '');
  if (valor.length <= 10) {
    return valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  } else {
    return valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  }
}

export function formatarMoeda(valor: string) {
  valor = valor.replace(/\D/g, '');
  valor = (parseInt(valor, 10) / 100).toFixed(2) + '';
  valor = valor.replace('.', ',');
  valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  return valor;
}