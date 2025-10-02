console.log('🔍 TESTE DE DEBUG - VENDAS FRONTEND');

// Adicionar este código no console do browser (F12) para testar
// 1. Abra a página de vendas
// 2. Abra o console (F12)
// 3. Cole este código e execute

// Simular a chamada exata que o frontend faz
function testarChamadaVenda() {
    console.log('🚀 Iniciando teste de chamada para vendas...');
    
    const dadosVenda = {
        itens: [
            {
                produto_id: 1,
                quantidade: 1,
                preco_unitario: 20.0
            }
        ],
        cliente_id: 1,
        forma_pagamento: 'conta_fiada',
        desconto: 0,
        observacoes: 'Teste via console',
        valor_recebido: null
    };
    
    console.log('📊 Dados da venda:', dadosVenda);
    
    // Usar fetch para simular a chamada
    fetch('/gerenciamento/vendas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            // O token CSRF será adicionado automaticamente pelo Laravel
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify(dadosVenda)
    })
    .then(response => {
        console.log('📈 Status da resposta:', response.status);
        console.log('🔗 URL de resposta:', response.url);
        return response.text();
    })
    .then(data => {
        console.log('📋 Resposta do servidor:', data);
    })
    .catch(error => {
        console.error('❌ Erro na requisição:', error);
    });
}

// Executar o teste
testarChamadaVenda();

console.log('💡 INSTRUÇÕES:');
console.log('1. Verifique se apareceu "🎯 VendasController@store CHAMADO" nos logs do Laravel');
console.log('2. Se não aparecer, pode ser problema de autenticação');
console.log('3. Se aparecer, o controller está sendo chamado normalmente');
