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

            // Catálogo de produtos reais de mercado (nomes sérios)
            $productCatalog = [
                'Arroz Branco Tipo 1 5kg',
                'Feijão Carioca 1kg',
                'Açúcar Cristal 1kg',
                'Café Torrado e Moído 500g',
                'Macarrão Espaguete 500g',
                'Óleo de Soja 900ml',
                'Farinha de Trigo 1kg',
                'Leite UHT Integral 1L',
                'Sal Refinado 1kg',
                'Milho Verde em Lata 170g',
                'Ervilha em Lata 170g',
                'Molho de Tomate 340g',
                'Extrato de Tomate 130g',
                'Atum em Óleo 170g',
                'Sardinha em Óleo 125g',
                'Biscoito Cream Cracker 400g',
                'Biscoito Recheado Chocolate 140g',
                'Achocolatado em Pó 400g',
                'Margarina 500g',
                'Manteiga 200g',
                'Queijo Mussarela Fatiado 200g',
                'Queijo Prato Fatiado 200g',
                'Presunto Fatiado 200g',
                'Iogurte Natural 170g',
                'Iogurte Sabor Morango 170g',
                'Refrigerante Cola 2L',
                'Refrigerante Guaraná 2L',
                'Água Mineral 1,5L',
                'Suco de Laranja 1L',
                'Cerveja Pilsen 350ml',
                'Cerveja Long Neck 330ml',
                'Vinagre de Álcool 750ml',
                'Azeite de Oliva Extra Virgem 500ml',
                'Ketchup 397g',
                'Maionese 500g',
                'Mostarda 200g',
                'Papel Higiênico Neutro 12 rolos',
                'Papel Toalha 2 rolos',
                'Guardanapo 50 un',
                'Detergente Neutro 500ml',
                'Sabão em Pó 1,6kg',
                'Amaciante de Roupas 2L',
                'Desinfetante 2L',
                'Água Sanitária 1L',
                'Esponja Multiuso 3 un',
                'Saco de Lixo 50L 20 un',
                'Alvejante 1L',
                'Limpador Multiuso 500ml',
                'Sabonete Neutro 90g',
                'Shampoo 350ml',
                'Condicionador 350ml',
                'Creme Dental 90g',
                'Escova de Dentes Média',
                'Fio Dental 50m',
                'Desodorante Aerosol 150ml',
                'Barbeador Descartável 2 un',
                'Fralda Descartável M 20 un',
                'Lenço Umedecido 48 un',
                'Pão de Forma 500g',
                'Pão Francês 1kg',
                'Bolo de Fubá 400g',
                'Bolo de Chocolate 400g',
                'Banha Suína 1kg',
                'Carne Moída 1kg',
                'Peito de Frango 1kg',
                'Coxa e Sobrecoxa 1kg',
                'Linguiça Toscana 1kg',
                'Salsicha 500g',
                'Peixe Tilápia 1kg',
                'Bacalhau Dessalgado 1kg',
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
                'Manga Palmer unidade',
                'Arroz Integral 1kg',
                'Feijão Preto 1kg',
                'Granola 1kg',
                'Aveia em Flocos 500g',
                'Mel 300g',
                'Leite em Pó 400g',
                'Farinha de Mandioca 1kg',
                'Polvilho Doce 500g',
                'Polvilho Azedo 500g',
                'Farofa Pronta 500g',
                'Creme de Leite 200g',
                'Leite Condensado 395g',
                'Gelatina Sabor Morango 25g',
                'Flocão de Milho 500g',
                'Milho de Pipoca 500g',
                'Fermento Biológico Seco 10g',
                'Fermento Químico 100g',
                'Cacau em Pó 100g',
                'Chocolate em Barra 90g',
                'Bala de Gelatina 90g',
                'Chá Mate 250g',
                'Chá de Camomila 10 sachês',
                'Sucrilhos 300g',
                'Cereal Matinal 300g'
            ];

            // 1) Usuário base (tabela: usuario)
            $usuarioId = DB::table('usuario')->insertGetId([
                'NOME' => 'Admin',
                'EMAIL' => 'admin@example.com',
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

            // 3) Categorias (10) (tabela: categoria)
            $categoriaIds = [];
            for ($i = 0; $i < 10; $i++) {
                $nome = $faker->unique()->words(2, true);
                $categoriaIds[] = DB::table('categoria')->insertGetId([
                    'nome' => substr(ucfirst($nome), 0, 100),
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

            // 5) Produtos (100) + Estoque (tabela: produto, estoque)
            $produtos = []; // manteremos mapa id => [preco, qtd]
            for ($i = 0; $i < 100; $i++) {
                $categoriaId = $categoriaIds[array_rand($categoriaIds)];
                $estoqueMin = random_int(0, 20);
                $qtd = random_int(0, 200);
                // Preços mais realistas para supermercado
                $preco = $faker->randomFloat(2, 1, 120);

                // Nome sério do catálogo com variação opcional para garantir unicidade
                $baseName = $productCatalog[$i % count($productCatalog)];
                $suffix = $i >= count($productCatalog) ? ' - Lote ' . (int) floor($i / count($productCatalog)) : '';
                $nomeProduto = substr($baseName . $suffix, 0, 150);

                $produtoId = DB::table('produto')->insertGetId([
                    'nome' => $nomeProduto,
                    'preco' => $preco,
                    'foto_path' => null,
                    'quantidade_estoque' => $qtd,
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

            // 6) Vendas removidas (você fará manualmente)
        });
    }
}
