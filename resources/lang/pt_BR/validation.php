<?php
// filepath: c:\Users\User\Desktop\TCC\resources\lang\pt_BR\validation.php

return [
    /*
    |--------------------------------------------------------------------------
    | ❌ NÃO ALTERE - CONFIGURAÇÕES BÁSICAS DO LARAVEL
    |--------------------------------------------------------------------------
    | Estas são configurações padrão do Laravel que mantêm o sistema funcionando
    | corretamente. Alterar pode quebrar validações em outras partes do sistema.
    */

    // Validações básicas obrigatórias - NÃO ALTERE
    'required' => 'O campo :attribute é obrigatório.',
    'string' => 'O campo :attribute deve ser um texto.',
    'numeric' => 'O campo :attribute deve ser um número.',
    'email' => 'Digite um e-mail válido.',
    'unique' => 'Este :attribute já está cadastrado.',
    'confirmed' => 'A confirmação de :attribute não confere.',
    'regex' => 'O formato do campo :attribute é inválido.',
    'in' => 'O :attribute selecionado é inválido.',
    'different' => 'Os campos :attribute e :other devem ser diferentes.',
    'same' => 'Os campos :attribute e :other devem ser iguais.',

    // Validações de tamanho - NÃO ALTERE
    'digits' => 'O campo :attribute deve ter :digits dígitos.',
    'digits_between' => 'O campo :attribute deve ter entre :min e :max dígitos.',
    'size' => [
        'string' => 'O campo :attribute deve ter exatamente :size caracteres.',
    ],
    'min' => [
        'string' => 'O campo :attribute deve ter pelo menos :min caracteres.',
    ],
    'max' => [
        'string' => 'O campo :attribute não pode ter mais que :max caracteres.',
    ],
    'between' => [
        'string' => 'O campo :attribute deve ter entre :min e :max caracteres.',
    ],

    // Validações de texto - NÃO ALTERE
    'alpha' => 'O campo :attribute deve conter apenas letras.',
    'alpha_dash' => 'O campo :attribute deve conter apenas letras, números, "_" e "-".',

    // Validações de senha do Laravel - NÃO ALTERE
    'password' => [
        'letters' => 'A senha deve conter pelo menos uma letra.',
        'mixed' => 'A senha deve conter pelo menos uma letra maiúscula e uma minúscula.',
        'numbers' => 'A senha deve conter pelo menos um número.',
        'symbols' => 'A senha deve conter pelo menos um símbolo.',
        'uncompromised' => 'Esta senha foi encontrada em vazamentos de dados. Escolha uma senha diferente.',
    ],

    /*
    |--------------------------------------------------------------------------
    | ✅ ALTERE AQUI - MENSAGENS GLOBAIS PERSONALIZADAS
    |--------------------------------------------------------------------------
    | Estas mensagens afetam TODAS as validações do mesmo tipo no sistema.
    | Altere conforme necessário para personalizar as mensagens.
    */

    // ✅ MENSAGEM GLOBAL DO CNPJ - Afeta todo o sistema
    'cnpj_invalid' => 'O :attribute informado é inválido.',

    // ✅ MENSAGEM GLOBAL DE PERFIL - Afeta todo o sistema
    'profile_in_use' => 'Este perfil já está em uso.',

    /*
    |--------------------------------------------------------------------------
    | ✅ ALTERE AQUI - MENSAGENS ESPECÍFICAS POR CAMPO
    |--------------------------------------------------------------------------
    | ESTA É A SEÇÃO PRINCIPAL para customizar mensagens específicas.
    | Estas mensagens têm PRIORIDADE sobre as mensagens globais.
    */
    'custom' => [
        
        // ✅ MENSAGENS DO CNPJ - ALTERE AQUI PARA TROCAR A MENSAGEM
        'COMERCIO_CNPJ' => [
            'required' => 'O CNPJ é obrigatório.',
            'size' => 'O CNPJ deve ter exatamente 14 dígitos.',
            'regex' => 'O CNPJ deve conter apenas números.',
            'unique' => 'Este CNPJ já está cadastrado.',
            
            // 🎯 ESTA É A LINHA PRINCIPAL QUE CONTROLA A MENSAGEM DO CNPJ INVÁLIDO:
            'cnpj_invalid' => 'O CNPJ informado é inválido.',
            
            // ✅ EXEMPLOS DE MENSAGENS ALTERNATIVAS (descomente a que quiser):
            // 'cnpj_invalid' => '🚨 CNPJ inválido! Verifique se os números estão corretos.',
            // 'cnpj_invalid' => '⚠️ CNPJ inválido. Confirme os dígitos informados.',
            // 'cnpj_invalid' => '❌ CNPJ incorreto. Digite um CNPJ válido.',
            // 'cnpj_invalid' => 'CNPJ com dígitos verificadores incorretos.',
            // 'cnpj_invalid' => 'O CNPJ não passou na validação da Receita Federal.',
        ],
        
        // ✅ MENSAGENS DO NOME - ALTERE AQUI SE NECESSÁRIO
        'NOME' => [
            'required' => 'O nome é obrigatório.',
            'regex' => 'O formato do nome é inválido.',
            'alpha' => 'O nome deve conter apenas letras.',
        ],
        
        // ✅ MENSAGENS DO PERFIL - ALTERE AQUI SE NECESSÁRIO
        'PERFIL' => [
            'profile_in_use' => 'Este perfil já está em uso.',
        ],
        
        // ✅ MENSAGENS DO EMAIL - ALTERE AQUI SE NECESSÁRIO
        'EMAIL' => [
            'required' => 'O e-mail é obrigatório.',
            'email' => 'Digite um e-mail válido.',
            'unique' => 'Este e-mail já está cadastrado.',
        ],
        
        // ✅ MENSAGENS DA SENHA - ALTERE AQUI SE NECESSÁRIO
        'SENHA_HASH' => [
            'required' => 'A senha é obrigatória.',
            'min' => 'A senha deve ter pelo menos 8 caracteres.',
            'confirmed' => 'A confirmação da senha não confere.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | ❌ NÃO ALTERE - MAPEAMENTO DE NOMES DOS CAMPOS
    |--------------------------------------------------------------------------
    | Esta seção mapeia os nomes técnicos dos campos para nomes amigáveis.
    | Só altere se quiser mudar como os campos são referenciados nas mensagens.
    */
    'attributes' => [
        'NOME' => 'nome',
        'EMAIL' => 'e-mail',
        'SENHA_HASH' => 'senha',
        'SENHA_HASH_confirmation' => 'confirmação da senha',
        'PERFIL' => 'perfil',
        'COMERCIO_NOME' => 'nome do comércio',
        'COMERCIO_CNPJ' => 'CNPJ do comércio',
        'remember' => 'lembrar-me',
        'password' => 'senha',
        'password_confirmation' => 'confirmação da senha',
        'current_password' => 'senha atual',
        'name' => 'nome',
        'username' => 'usuário',
    ],

    /*
    |--------------------------------------------------------------------------
    | ✅ MENSAGENS CENTRALIZADAS - CLIENTE
    |--------------------------------------------------------------------------
    */
    
    // Mensagens globais para clientes
    'cliente_email_exists' => 'Este e-mail já está cadastrado neste comércio.',
    'cliente_creation_failed' => 'Falha ao criar cliente. Tente novamente.',
    'cliente_not_found' => 'Cliente não encontrado.',
    'conta_creation_failed' => 'Falha ao criar conta fiada.',
    'comercio_not_found' => 'Comércio não encontrado para o usuário.',
    
    'custom' => [
        // ✅ MENSAGENS ESPECÍFICAS DO CLIENTE
        'nome' => [
            'required' => 'O nome do cliente é obrigatório.',
            'string' => 'O nome deve ser um texto válido.',
            'max' => 'O nome não pode ter mais que :max caracteres.',
            'regex' => 'O nome deve conter apenas letras e espaços.',
        ],
        
        'email' => [
            'required' => 'O e-mail é obrigatório.',
            'email' => 'Digite um e-mail válido.',
            'max' => 'O e-mail não pode ter mais que :max caracteres.',
            'unique' => 'Este e-mail já está cadastrado.',
        ],
        
        'telefone' => [
            'string' => 'O telefone deve ser um texto válido.',
            'max' => 'O telefone não pode ter mais que :max caracteres.',
            'regex' => 'Formato de telefone inválido. Use apenas números, espaços, parênteses e hífens.',
            // ✅ Mensagens específicas para limites de dígitos
            'digits_max' => 'O telefone não pode ter mais que 11 dígitos.',
            'digits_min' => 'O telefone deve ter pelo menos 10 dígitos.',
        ],
        
        'saldo_inicial' => [
            'numeric' => 'O saldo inicial deve ser um número válido.',
            'min' => 'O saldo inicial não pode ser menor que R$ :min.',
            'max' => 'O saldo inicial não pode ser maior que R$ :max.',
        ],
        
        'descricao' => [
            'string' => 'A descrição deve ser um texto válido.',
            'max' => 'A descrição não pode ter mais que :max caracteres.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | ✅ MENSAGENS CENTRALIZADAS - PDV/VENDAS
    |--------------------------------------------------------------------------
    */
    
    // Mensagens específicas do PDV
    'pdv_carrinho_vazio' => 'Adicione pelo menos um produto à venda!',
    'pdv_valor_insuficiente' => 'Valor recebido insuficiente para finalizar a venda!',
    'pdv_cliente_obrigatorio' => 'Selecione um cliente para venda fiada!',
    'pdv_estoque_insuficiente' => 'Estoque insuficiente! Disponível: :disponivel unidades',
    'pdv_estoque_maximo' => 'Estoque insuficiente! Máximo: :maximo unidades',
    'pdv_produto_inativo' => 'Produto inativo: :produto',
    'pdv_produto_nao_encontrado' => 'Produto não encontrado',
    'pdv_venda_processada' => '✅ Venda realizada com sucesso!',
    'pdv_venda_cancelada' => '✅ Venda cancelada com sucesso!',
    'pdv_erro_processar' => 'Erro ao processar venda. Tente novamente.',
    'pdv_erro_cancelar' => 'Erro ao cancelar venda. Tente novamente.',
    'pdv_venda_nao_encontrada' => 'Venda não encontrada.',
    'pdv_venda_ja_cancelada' => 'Esta venda já foi cancelada.',
    
    'custom' => [
        // ✅ MENSAGENS ESPECÍFICAS DE VENDA
        'itens' => [
            'required' => 'Adicione pelo menos um produto à venda.',
            'array' => 'Formato de itens inválido.',
            'min' => 'Adicione pelo menos um produto à venda.',
        ],
        
        'itens.*.produto_id' => [
            'required' => 'Produto obrigatório.',
            'integer' => 'ID do produto inválido.',
            'exists' => 'Produto não encontrado.',
        ],
        
        'itens.*.quantidade' => [
            'required' => 'Quantidade obrigatória.',
            'integer' => 'Quantidade deve ser um número inteiro.',
            'min' => 'Quantidade deve ser maior que zero.',
        ],
        
        'forma_pagamento' => [
            'required' => 'Selecione uma forma de pagamento.',
            'in' => 'Forma de pagamento inválida.',
        ],
        
        'cliente_id' => [
            'required_if' => 'Cliente obrigatório para venda fiada.',
            'exists' => 'Cliente não encontrado.',
        ],
        
        'valor_recebido' => [
            'required_if' => 'Valor recebido obrigatório para pagamento em dinheiro.',
            'numeric' => 'Valor recebido deve ser um número.',
            'min' => 'Valor recebido deve ser maior que zero.',
        ],
    ],

    // ✅ Mensagens de erro de sistema
    'database_error' => 'Erro de conexão com o banco de dados. Tente novamente.',
    'system_error' => 'Erro interno do sistema. Contate o suporte.',
];