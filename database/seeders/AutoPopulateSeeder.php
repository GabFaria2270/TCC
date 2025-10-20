<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AutoPopulateSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create('pt_BR');

        DB::transaction(function () use ($faker) {
            $now = now();
            // Mapa de categorias fixas com seus produtos
            $categoryMap = [
                'Grãos e Cereais' => [
                    'Arroz Branco Tipo 1 5kg',
                    'Arroz Integral 1kg',
                    'Feijão Carioca 1kg',
                    'Feijão Preto 1kg',
                    'Aveia em Flocos 500g',
                    'Granola 1kg',
                    'Sucrilhos 300g',
                    'Cereal Matinal 300g',
                    'Farofa Pronta 500g',
                    'Farinha de Mandioca 1kg',
                    'Farinha de Trigo 1kg',
                    'Milho de Pipoca 500g',
                    'Flocão de Milho 500g',
                    'Polvilho Doce 500g',
                    'Polvilho Azedo 500g'
                ],
                'Açúcares e Adoçantes' => [
                    'Açúcar Cristal 1kg',
                    'Mel 300g'
                ],
                'Café, Chás e Cacau' => [
                    'Café Torrado e Moído 500g',
                    'Chá Mate 250g',
                    'Chá de Camomila 10 sachês',
                    'Achocolatado em Pó 400g',
                    'Cacau em Pó 100g'
                ],
                'Massas e Molhos' => [
                    'Macarrão Espaguete 500g',
                    'Molho de Tomate 340g',
                    'Extrato de Tomate 130g',
                    'Ketchup 397g',
                    'Maionese 500g',
                    'Mostarda 200g'
                ],
                'Óleos e Condimentos' => [
                    'Óleo de Soja 900ml',
                    'Azeite de Oliva Extra Virgem 500ml',
                    'Vinagre de Álcool 750ml',
                    'Sal Refinado 1kg'
                ],
                'Laticínios' => [
                    'Leite UHT Integral 1L',
                    'Leite em Pó 400g',
                    'Iogurte Natural 170g',
                    'Iogurte Sabor Morango 170g',
                    'Manteiga 200g',
                    'Margarina 500g',
                    'Queijo Mussarela Fatiado 200g',
                    'Queijo Prato Fatiado 200g'
                ],
                'Frios e Embutidos' => [
                    'Presunto Fatiado 200g',
                    'Linguiça Toscana 1kg',
                    'Salsicha 500g'
                ],
                'Padaria e Confeitaria' => [
                    'Pão de Forma 500g',
                    'Pão Francês 1kg',
                    'Bolo de Fubá 400g',
                    'Bolo de Chocolate 400g',
                    'Fermento Biológico Seco 10g',
                    'Fermento Químico 100g',
                    'Chocolate em Barra 90g',
                    'Gelatina Sabor Morango 25g'
                ],
                'Enlatados e Conservas' => [
                    'Milho Verde em Lata 170g',
                    'Ervilha em Lata 170g',
                    'Atum em Óleo 170g',
                    'Sardinha em Óleo 125g',
                    'Creme de Leite 200g',
                    'Leite Condensado 395g'
                ],
                'Bebidas' => [
                    'Refrigerante Cola 2L',
                    'Refrigerante Guaraná 2L',
                    'Água Mineral 1,5L',
                    'Suco de Laranja 1L',
                    'Cerveja Pilsen 350ml',
                    'Cerveja Long Neck 330ml'
                ],
                'Carnes, Aves e Peixes' => [
                    'Carne Moída 1kg',
                    'Peito de Frango 1kg',
                    'Coxa e Sobrecoxa 1kg',
                    'Peixe Tilápia 1kg',
                    'Bacalhau Dessalgado 1kg',
                    'Banha Suína 1kg'
                ],
                'Hortifruti' => [
                    'Batata Inglesa 1kg',
                    'Cebola 1kg',
                    'Alho 200g',
                    'Tomate 1kg',
                    'Alface Crespa unidade',
                    'Cenoura 1kg',
                    'Banana Prata 1kg',
                    'Maçã Gala 1kg',
                    'Laranja Pera 1kg',
                    'Mamão Papaya unidade',
                    'Uva Sem Semente 500g',
                    'Manga Palmer unidade'
                ],
                'Higiene Pessoal' => [
                    'Sabonete Neutro 90g',
                    'Shampoo 350ml',
                    'Condicionador 350ml',
                    'Creme Dental 90g',
                    'Escova de Dentes Média',
                    'Fio Dental 50m',
                    'Desodorante Aerosol 150ml',
                    'Barbeador Descartável 2 un',
                    'Fralda Descartável M 20 un',
                    'Lenço Umedecido 48 un'
                ],
                'Limpeza e Utilidades' => [
                    'Detergente Neutro 500ml',
                    'Sabão em Pó 1,6kg',
                    'Amaciante de Roupas 2L',
                    'Desinfetante 2L',
                    'Água Sanitária 1L',
                    'Esponja Multiuso 3 un',
                    'Saco de Lixo 50L 20 un',
                    'Alvejante 1L',
                    'Limpador Multiuso 500ml',
                    'Papel Higiênico Neutro 12 rolos',
                    'Papel Toalha 2 rolos',
                    'Guardanapo 50 un'
                ],
                'Biscoitos e Doces' => [
                    'Biscoito Cream Cracker 400g',
                    'Biscoito Recheado Chocolate 140g',
                    'Bala de Gelatina 90g'
                ],
            ];

            // 1) Usuário base (tabela: usuario)
            $usuarioId = DB::table('usuario')->insertGetId([
                'NOME' => 'Admin',
                'EMAIL' => 'admin@gmail.com',
                'SENHA_HASH' => Hash::make('Admin40028922#'),
                'PERFIL' => 'admin',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // 2) Comércio (tabela: comercio)
            $cnpj = str_pad((string) random_int(0, 99999999999999), 14, '0', STR_PAD_LEFT);
            $comercioId = DB::table('comercio')->insertGetId([
                'nome' => $faker->company(),
                'cnpj' => $cnpj,
                'usuario_id' => $usuarioId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            // 3) Categorias fixas (tabela: categoria)
            $categoriaIdsByName = [];
            foreach (array_keys($categoryMap) as $catName) {
                $categoriaIdsByName[$catName] = DB::table('categoria')->insertGetId([
                    'nome' => $catName,
                    'comercio_id' => $comercioId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            // 4) Clientes (30) (tabela: cliente)
            $clienteIds = [];
            for ($i = 0; $i < 30; $i++) {
                $clienteIds[] = DB::table('cliente')->insertGetId([
                    'nome' => $faker->name(),
                    'email' => $faker->unique()->safeEmail(),
                    'telefone' => $faker->optional()->numerify('(##) #####-####'),
                    'comercio_id' => $comercioId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            // 4.1) Conta fiada removida (você fará manualmente)

            // 5) Produtos por categoria + Estoque (tabela: produto, estoque)
            $produtos = [];
            foreach ($categoryMap as $catName => $items) {
                $categoriaId = $categoriaIdsByName[$catName];

                foreach ($items as $nomeProduto) {
                    $estoqueMin = random_int(0, 20);
                    $qtd = random_int(0, 200);
                    $preco = $faker->randomFloat(2, 1, 120);

                    $produtoId = DB::table('produto')->insertGetId([
                        'nome' => $nomeProduto,
                        'preco' => $preco,
                        'foto_path' => null,
                        'estoque_minimo' => $estoqueMin,
                        'categoria_id' => $categoriaId,
                        'comercio_id' => $comercioId,
                        'created_at' => $now,
                        'updated_at' => $now,
                        'deleted_at' => null,
                    ]);

                    DB::table('estoque')->insert([
                        'produto_id' => $produtoId,
                        'quantidade' => $qtd,
                        'comercio_id' => $comercioId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                    $produtos[$produtoId] = [
                        'preco' => $preco,
                        'qtd' => $qtd,
                    ];
                }
            }

            // 6) Vendas removidas (você fará manualmente)
        });
    }
}
