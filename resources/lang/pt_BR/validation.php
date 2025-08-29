<?php


return [
    'required' => 'O campo :attribute é obrigatório.',
    'email' => 'Digite um email válido.',
    'unique' => 'Este :attribute já está cadastrado.',
    'confirmed' => 'A confirmação de :attribute não confere.',
    'min' => [
        'string' => 'O campo :attribute deve ter pelo menos :min caracteres.',
        'numeric' => 'O campo :attribute deve ser no mínimo :min.',
    ],
    'max' => [
        'string' => 'O campo :attribute deve ter no máximo :max caracteres.',
        'numeric' => 'O campo :attribute deve ser no máximo :max.',
    ],
    'regex' => 'O campo :attribute possui formato inválido.',
    'lowercase' => 'O campo :attribute deve estar em minúsculas.',
    'alpha_dash' => 'O campo :attribute deve conter apenas letras, números, "_" e "-".',
    'size' => 'O campo :attribute deve ter :size caracteres.',
    'letters' => 'O campo :attribute deve conter pelo menos uma letra.',
    'mixed' => 'O campo :attribute deve conter pelo menos uma letra maiúscula e uma minúscula.',
    'numbers' => 'O campo :attribute deve conter pelo menos um número.',
    'symbols' => 'O campo :attribute deve conter pelo menos um símbolo.',
    'uncompromised' => '⚠️ Esta senha foi encontrada em vazamentos de dados. Escolha uma senha diferente.',

    'password' => [
        'letters' => 'A senha deve conter pelo menos uma letra.',
        'mixed' => 'A senha deve conter pelo menos uma letra maiúscula e uma minúscula.',
        'numbers' => 'A senha deve conter pelo menos um número.',
        'symbols' => 'A senha deve conter pelo menos um símbolo.',
        'uncompromised' => '⚠️ Esta senha foi encontrada em vazamentos de dados. Escolha uma senha diferente.',
    ],

    'attributes' => [
        'NOME' => 'nome',
        'EMAIL' => 'e-mail',
        'SENHA_HASH' => 'senha',
        'SENHA_HASH_confirmation' => 'confirmação da senha',
        'PERFIL' => 'perfil',
        'COMERCIO_NOME' => 'nome do comércio',
        'COMERCIO_CNPJ' => 'CNPJ do comércio',
        'remember' => 'lembrar-me', // se usar o campo lembrar-me no login
    ],
];