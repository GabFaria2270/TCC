<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Mensagens de Validação para Formulários (Login/Cadastro)
    |--------------------------------------------------------------------------
    */

    // Mensagens básicas essenciais
    'required' => 'O campo :attribute é obrigatório.',
    'email' => 'Digite um e-mail válido.',
    'unique' => 'Este :attribute já está cadastrado.',
    'confirmed' => 'A confirmação de :attribute não confere.',
    'regex' => 'O formato do campo :attribute é inválido.',
    'string' => 'O campo :attribute deve ser um texto.',
    'numeric' => 'O campo :attribute deve ser um número.',
    'in' => 'O :attribute selecionado é inválido.',
    'digits' => 'O campo :attribute deve ter :digits dígitos.',
    'digits_between' => 'O campo :attribute deve ter entre :min e :max dígitos.',
    'size' => [
        'string' => 'O campo :attribute deve ter exatamente :size caracteres.',
        'numeric' => 'O campo :attribute deve ser exatamente :size.',
    ],

    // Validações de tamanho
    'min' => [
        'string' => 'O campo :attribute deve ter pelo menos :min caracteres.',
        'numeric' => 'O campo :attribute deve ser no mínimo :min.',
    ],
    'max' => [
        'string' => 'O campo :attribute deve ter no máximo :max caracteres.',
        'numeric' => 'O campo :attribute deve ser no máximo :max.',
    ],

    // Validações específicas para senha (Laravel Password Rules)
    'password' => [
        'letters' => 'A senha deve conter pelo menos uma letra.',
        'mixed' => 'A senha deve conter pelo menos uma letra maiúscula e uma minúscula.',
        'numbers' => 'A senha deve conter pelo menos um número.',
        'symbols' => 'A senha deve conter pelo menos um símbolo.',
        'uncompromised' => 'Esta senha foi encontrada em vazamentos de dados. Escolha uma senha diferente.',
    ],

    // ADICIONANDO mensagens específicas que estavam hardcoded:
    'cnpj_invalid' => 'O :attribute informado é inválido.',
    'alpha' => 'O campo :attribute deve conter apenas letras.',
    'alpha_dash' => 'O campo :attribute deve conter apenas letras, números, "_" e "-".',
    'profile_in_use' => 'Este perfil já está em uso.',

    /*
    |--------------------------------------------------------------------------
    | Mensagens Customizadas por Campo
    |--------------------------------------------------------------------------
    */
    'custom' => [
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
        'PERFIL' => [
            'profile_in_use' => 'Este perfil já está em uso.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Nomes dos Campos (Attributes)
    |--------------------------------------------------------------------------
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
        
        // Campos adicionais
        'password' => 'senha',
        'password_confirmation' => 'confirmação da senha',
        'current_password' => 'senha atual',
        'name' => 'nome',
        'username' => 'usuário',
    ],
];