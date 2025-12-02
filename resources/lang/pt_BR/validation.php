<?php

return [
    /*
    |--------------------------------------------------------------------------
    | 🛒 MENSAGENS DO PDV/VENDAS - EDITÁVEIS
    |--------------------------------------------------------------------------
    | EDITE AQUI: Altere as mensagens abaixo para personalizar seu sistema
    */
    
    // ✅ MENSAGENS DE SUCESSO (aparece quando algo dá certo)
    'pdv_venda_processada' => '🎉 Perfeito! Venda finalizada com sucesso!',
    'pdv_venda_cancelada' => '↩️ Venda cancelada e estoque revertido!',
    'pdv_produto_adicionado' => '🛒 Produto adicionado ao seu carrinho!',
    'pdv_produto_removido' => '🗑️ Item removido do carrinho!',
    'pdv_quantidade_atualizada' => '🔄 Quantidade atualizada com sucesso!',
    
    // ✅ MENSAGENS DE AVISO (aparece para orientar o usuário)
    'pdv_carrinho_vazio' => 'Adicione pelo menos um produto à venda!',
    'pdv_cliente_obrigatorio' => 'Selecione um cliente para venda fiada!',
    'pdv_produto_ja_no_carrinho' => 'Este produto já está no carrinho!',
    
    // ✅ MENSAGENS DE ERRO - ESTOQUE
    'pdv_estoque_insuficiente' => 'Estoque insuficiente! Disponível: :disponivel unidades',
    'pdv_estoque_maximo' => 'Estoque insuficiente! Máximo: :maximo unidades',
    'pdv_sem_estoque' => 'Produto sem estoque disponível!',
    
    // ✅ MENSAGENS DE ERRO - PAGAMENTO
    'pdv_valor_insuficiente' => 'Valor recebido insuficiente para finalizar a venda!',
    'pdv_pagamento_nao_encontrado' => 'Pagamento não encontrado para esta venda.',
    
    // ✅ MENSAGENS DE ERRO - PRODUTO
    'pdv_produto_inativo' => 'Produto inativo: :produto',
    'pdv_produto_nao_encontrado' => 'Produto não encontrado',
    'pdv_produto_quantidade_zero' => 'Quantidade deve ser maior que zero!',
    
    // ✅ MENSAGENS DE ERRO - SISTEMA
    'pdv_erro_processar' => 'Erro ao processar venda. Tente novamente.',
    'pdv_erro_cancelar' => 'Erro ao cancelar venda. Tente novamente.',
    'pdv_venda_nao_encontrada' => 'Venda não encontrada.',
    'pdv_venda_ja_cancelada' => 'Esta venda já foi cancelada.',
    'pdv_erro_interno' => 'Erro interno do sistema. Tente novamente.',
    
    // ✅ MENSAGENS DE ERRO - FRONTEND (JavaScript)
    'pdv_js_produto_indisponivel' => 'Produto indisponível!',
    'pdv_js_estoque_excedido' => 'Estoque insuficiente! Máximo: :max unidades',
    'pdv_js_erro_adicionar' => 'Erro ao adicionar produto',
    'pdv_js_erro_remover' => 'Erro ao remover produto',
    'pdv_js_erro_atualizar' => 'Erro ao atualizar quantidade',
    'pdv_js_erro_finalizar' => 'Erro ao finalizar venda',

    /*
    |--------------------------------------------------------------------------
    | 📝 MENSAGENS DE VALIDAÇÃO DE CAMPOS
    |--------------------------------------------------------------------------
    | EDITE AQUI: Mensagens que aparecem quando os campos estão inválidos
    */
    
    // Validações de itens da venda
    'venda_itens_required' => 'Adicione pelo menos um produto à venda.',
    'venda_itens_array' => 'Formato de itens inválido.',
    'venda_itens_min' => 'Adicione pelo menos um produto à venda.',
    
    // Validações de produto
    'venda_produto_required' => 'Produto obrigatório.',
    'venda_produto_integer' => 'ID do produto inválido.',
    'venda_produto_exists' => 'Produto não encontrado.',
    
    // Validações de quantidade
    'venda_quantidade_required' => 'Quantidade obrigatória.',
    'venda_quantidade_integer' => 'Quantidade deve ser um número inteiro.',
    'venda_quantidade_min' => 'Quantidade deve ser maior que zero.',
    
    // Validações de preço
    'venda_preco_required' => 'Preço unitário obrigatório.',
    'venda_preco_numeric' => 'Preço unitário deve ser um número.',
    'venda_preco_min' => 'Preço unitário deve ser maior que zero.',
    
    // Validações de forma de pagamento
    'venda_forma_pagamento_required' => 'Selecione uma forma de pagamento.',
    'venda_forma_pagamento_in' => 'Forma de pagamento inválida.',
    
    // Validações de cliente
    'venda_cliente_required_if' => 'Cliente obrigatório para venda fiada.',
    'venda_cliente_exists' => 'Cliente não encontrado.',
    'venda_cliente_integer' => 'ID do cliente inválido.',
    
    // Validações de valor recebido
    'venda_valor_recebido_required_if' => 'Valor recebido obrigatório para pagamento em dinheiro.',
    'venda_valor_recebido_numeric' => 'Valor recebido deve ser um número.',
    'venda_valor_recebido_min' => 'Valor recebido deve ser maior que zero.',
    
    // Validações de desconto
    'venda_desconto_numeric' => 'Desconto deve ser um número.',
    'venda_desconto_min' => 'Desconto não pode ser negativo.',
    'venda_desconto_max' => 'Desconto não pode ser maior que o valor total.',
    
    // Validações de observações
    'venda_observacoes_string' => 'Observações devem ser um texto.',
    'venda_observacoes_max' => 'Observações não podem ter mais que :max caracteres.',

    /*
    |--------------------------------------------------------------------------
    | ❌ NÃO ALTERE - CONFIGURAÇÕES TÉCNICAS
    |--------------------------------------------------------------------------
    | Configurações necessárias para o Laravel funcionar - NÃO EDITE
    */
    
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
    'exists' => 'O :attribute selecionado é inválido.',
    'integer' => 'O campo :attribute deve ser um número inteiro.',
    'array' => 'O campo :attribute deve ser uma lista.',
    'digits' => 'O campo :attribute deve ter :digits dígitos.',
    'digits_between' => 'O campo :attribute deve ter entre :min e :max dígitos.',
    'size' => ['string' => 'O campo :attribute deve ter exatamente :size caracteres.'],
    'min' => [
        'string' => 'O campo :attribute deve ter pelo menos :min caracteres.',
        'numeric' => 'O campo :attribute deve ser maior ou igual a :min.',
        'integer' => 'O campo :attribute deve ser maior ou igual a :min.',
        'array' => 'O campo :attribute deve ter pelo menos :min itens.',
    ],
    'max' => [
        'string' => 'O campo :attribute não pode ter mais que :max caracteres.',
        'numeric' => 'O campo :attribute não pode ser maior que :max.',
        'integer' => 'O campo :attribute não pode ser maior que :max.',
    ],
    'between' => ['string' => 'O campo :attribute deve ter entre :min e :max caracteres.'],
    'alpha' => 'O campo :attribute deve conter apenas letras.',
    'alpha_dash' => 'O campo :attribute deve conter apenas letras, números, "_" e "-".',
    'required_if' => 'O campo :attribute é obrigatório quando :other for :value.',
    'required_without' => 'O campo :attribute é obrigatório quando :other não estiver presente.',
    'password' => [
        'letters' => 'A senha deve conter pelo menos uma letra.',
        'mixed' => 'A senha deve conter pelo menos uma letra maiúscula e uma minúscula.',
        'numbers' => 'A senha deve conter pelo menos um número.',
        'symbols' => 'A senha deve conter pelo menos um símbolo.',
        'uncompromised' => 'Esta senha foi encontrada em vazamentos de dados. Escolha uma senha diferente.',
    ],

    'custom' => [
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
        'itens.*.preco_unitario' => [
            'required' => 'Preço unitário obrigatório.',
            'numeric' => 'Preço unitário deve ser um número.',
            'min' => 'Preço unitário deve ser maior que zero.',
        ],
        'forma_pagamento' => [
            'required' => 'Selecione uma forma de pagamento.',
            'in' => 'Forma de pagamento inválida.',
        ],
        'cliente_id' => [
            'required_if' => 'Cliente obrigatório para venda fiada.',
            'exists' => 'Cliente não encontrado.',
            'integer' => 'ID do cliente inválido.',
        ],
        'valor_recebido' => [
            'required_if' => 'Valor recebido obrigatório para pagamento em dinheiro.',
            'numeric' => 'Valor recebido deve ser um número.',
            'min' => 'Valor recebido deve ser maior que zero.',
        ],
        'desconto' => [
            'numeric' => 'Desconto deve ser um número.',
            'min' => 'Desconto não pode ser negativo.',
            'max' => 'Desconto não pode ser maior que o valor total.',
        ],
        'observacoes' => [
            'string' => 'Observações devem ser um texto.',
            'max' => 'Observações não podem ter mais que :max caracteres.',
        ],
        'COMERCIO_CNPJ' => [
            'required' => 'O CNPJ é obrigatório.',
            'size' => 'O CNPJ deve ter exatamente 14 dígitos.',
            'regex' => 'O CNPJ deve conter apenas números.',
            'unique' => 'Este CNPJ já está cadastrado.',
            'cnpj_invalid' => 'O CNPJ informado é inválido.',
        ],
        'NOME' => [
            'required' => 'O nome é obrigatório.',
            'regex' => 'O formato do nome é inválido.',
            'alpha' => 'O nome deve conter apenas letras.',
        ],
        'PERFIL' => ['profile_in_use' => 'Este perfil já está em uso.'],
        'EMAIL' => [
            'required' => 'O e-mail é obrigatório.',
            'email' => 'Digite um e-mail válido.',
            'unique' => 'Este e-mail já está cadastrado.',
        ],
        'SENHA_HASH' => [
            'required' => 'A senha é obrigatória.',
            'min' => 'A senha deve ter pelo menos 8 caracteres.',
            'confirmed' => 'A confirmação da senha não confere.',
        ],
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

    'cliente_email_exists' => 'Este e-mail já está cadastrado para outro cliente.',
    'cliente_creation_failed' => 'Falha ao criar cliente. Tente novamente.',
    'cliente_not_found' => 'Cliente não encontrado.',
    'conta_creation_failed' => 'Falha ao criar conta fiada.',
    'comercio_not_found' => 'Comércio não encontrado para o usuário.',
    'database_error' => 'Erro de conexão com o banco de dados. Tente novamente.',
    'system_error' => 'Erro interno do sistema. Contate o suporte.',
    'cnpj_invalid' => 'O :attribute informado é inválido.',
    'profile_in_use' => 'Este perfil já está em uso.',

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
        'itens' => 'itens da venda',
        'itens.*.produto_id' => 'produto',
        'itens.*.quantidade' => 'quantidade',
        'itens.*.preco_unitario' => 'preço unitário',
        'forma_pagamento' => 'forma de pagamento',
        'cliente_id' => 'cliente',
        'valor_recebido' => 'valor recebido',
        'desconto' => 'desconto',
        'observacoes' => 'observações',
        'nome' => 'nome',
        'email' => 'e-mail',
        'telefone' => 'telefone',
        'saldo_inicial' => 'saldo inicial',
        'descricao' => 'descrição',
    ],
];