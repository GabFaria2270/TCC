-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 06-Out-2025 às 13:41
-- Versão do servidor: 8.0.30
-- versão do PHP: 8.3.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `basetcc`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel_cache_auth_token:4MLDnKDlLaXVBl9EGuj1p9sI8knvB6sbxYJkVMHC', 'a:8:{s:7:\"user_id\";i:1;s:5:\"email\";s:19:\"pbraz0460@gmail.com\";s:4:\"nome\";s:5:\"pablo\";s:6:\"perfil\";s:5:\"PABLO\";s:10:\"created_at\";s:19:\"2025-10-06 13:27:24\";s:10:\"expires_at\";s:19:\"2025-10-07 13:27:24\";s:2:\"ip\";s:9:\"127.0.0.1\";s:10:\"user_agent\";s:111:\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36\";}', 1759843644);

-- --------------------------------------------------------

--
-- Estrutura da tabela `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `categoria`
--

CREATE TABLE `categoria` (
  `id` bigint UNSIGNED NOT NULL,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comercio_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `categoria`
--

INSERT INTO `categoria` (`id`, `nome`, `comercio_id`, `created_at`, `updated_at`) VALUES
(1, 'Grao', 1, '2025-10-06 16:30:11', '2025-10-06 16:30:11');

-- --------------------------------------------------------

--
-- Estrutura da tabela `cliente`
--

CREATE TABLE `cliente` (
  `id` bigint UNSIGNED NOT NULL,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `comercio_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `cliente`
--

INSERT INTO `cliente` (`id`, `nome`, `email`, `telefone`, `created_at`, `updated_at`, `comercio_id`) VALUES
(1, 'Jojo', 'jojo@gmail.com', '15555553423', '2025-10-06 16:32:43', '2025-10-06 16:32:43', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `comercio`
--

CREATE TABLE `comercio` (
  `id` bigint UNSIGNED NOT NULL,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cnpj` varchar(14) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `comercio`
--

INSERT INTO `comercio` (`id`, `nome`, `cnpj`, `usuario_id`, `created_at`, `updated_at`) VALUES
(1, 'cop bom', '85083287000113', 1, '2025-10-06 16:27:24', '2025-10-06 16:27:24');

-- --------------------------------------------------------

--
-- Estrutura da tabela `conta_fiada`
--

CREATE TABLE `conta_fiada` (
  `id` bigint UNSIGNED NOT NULL,
  `cliente_id` bigint UNSIGNED NOT NULL,
  `comercio_id` bigint UNSIGNED NOT NULL,
  `saldo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `conta_fiada`
--

INSERT INTO `conta_fiada` (`id`, `cliente_id`, `comercio_id`, `saldo`, `descricao`, `created_at`, `updated_at`) VALUES
(2, 1, 1, 12000.00, 'Conta criada automaticamente na primeira venda fiada', '2025-10-06 16:36:30', '2025-10-06 16:36:30');

-- --------------------------------------------------------

--
-- Estrutura da tabela `estoque`
--

CREATE TABLE `estoque` (
  `id` bigint UNSIGNED NOT NULL,
  `produto_id` bigint UNSIGNED NOT NULL,
  `quantidade` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `comercio_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `estoque`
--

INSERT INTO `estoque` (`id`, `produto_id`, `quantidade`, `created_at`, `updated_at`, `comercio_id`) VALUES
(1, 1, 1, '2025-10-06 16:30:11', '2025-10-06 16:36:30', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `historico_de_pagamento`
--

CREATE TABLE `historico_de_pagamento` (
  `id` bigint UNSIGNED NOT NULL,
  `conta_fiada_id` bigint UNSIGNED NOT NULL,
  `valor_pago` decimal(10,2) NOT NULL,
  `data_pagamento` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `comercio_id` bigint UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `itens_venda`
--

CREATE TABLE `itens_venda` (
  `id` bigint UNSIGNED NOT NULL,
  `venda_id` bigint UNSIGNED NOT NULL,
  `produto_id` bigint UNSIGNED NOT NULL,
  `quantidade` int NOT NULL,
  `preco_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `itens_venda`
--

INSERT INTO `itens_venda` (`id`, `venda_id`, `produto_id`, `quantidade`, `preco_unitario`, `subtotal`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 1200.00, 1200.00, '2025-10-06 16:32:52', '2025-10-06 16:32:52'),
(2, 2, 1, 10, 1200.00, 12000.00, '2025-10-06 16:36:30', '2025-10-06 16:36:30');

-- --------------------------------------------------------

--
-- Estrutura da tabela `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000001_create_cache_table', 1),
(2, '2024_05_16_000000_create_usuario_table', 1),
(3, '2025_05_16_150232_create_sessions_table', 1),
(4, '2025_05_19_000002_create_comercio_table', 1),
(5, '2025_05_19_000003_create_categoria_table', 1),
(6, '2025_05_19_000004_create_produto_table', 1),
(7, '2025_05_19_000005_create_cliente_table', 1),
(8, '2025_05_19_000006_create_venda_table', 1),
(9, '2025_05_19_000007_create_conta_fiada_table', 1),
(10, '2025_05_19_000008_create_estoque_table', 1),
(11, '2025_05_19_000009_create_historico_de_pagamento_table', 1),
(12, '2025_05_19_000010_create_item_venda_table', 1),
(13, '2025_09_26_000010_create_movimento_estoque_table', 1),
(14, '2025_10_01_000011_add_comercio_id_to_categoria_table', 1),
(15, '2025_10_01_000012_add_estoque_minimo_to_produto_table', 1),
(16, '2025_10_01_000013_add_soft_deletes_and_foto_to_produto_table', 1),
(17, '2025_10_01_000014_add_unique_index_nome_por_comercio_in_produto', 1);

-- --------------------------------------------------------

--
-- Estrutura da tabela `movimentos_estoque`
--

CREATE TABLE `movimentos_estoque` (
  `id` bigint UNSIGNED NOT NULL,
  `produto_id` bigint UNSIGNED NOT NULL,
  `usuario_id` bigint UNSIGNED NOT NULL,
  `venda_id` bigint UNSIGNED DEFAULT NULL,
  `tipo` enum('entrada','saida','ajuste') COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantidade_anterior` int NOT NULL,
  `quantidade_movimentada` int NOT NULL,
  `quantidade_atual` int NOT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observacoes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `movimentos_estoque`
--

INSERT INTO `movimentos_estoque` (`id`, `produto_id`, `usuario_id`, `venda_id`, `tipo`, `quantidade_anterior`, `quantidade_movimentada`, `quantidade_atual`, `motivo`, `observacoes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 'saida', 12, 1, 11, 'Venda #1', NULL, '2025-10-06 16:32:52', '2025-10-06 16:32:52'),
(2, 1, 1, 2, 'saida', 11, 10, 1, 'Venda #2', NULL, '2025-10-06 16:36:30', '2025-10-06 16:36:30');

-- --------------------------------------------------------

--
-- Estrutura da tabela `produto`
--

CREATE TABLE `produto` (
  `id` bigint UNSIGNED NOT NULL,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `foto_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantidade_estoque` int NOT NULL DEFAULT '0',
  `estoque_minimo` int NOT NULL DEFAULT '0',
  `categoria_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `comercio_id` bigint UNSIGNED NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `produto`
--

INSERT INTO `produto` (`id`, `nome`, `preco`, `foto_path`, `quantidade_estoque`, `estoque_minimo`, `categoria_id`, `created_at`, `updated_at`, `comercio_id`, `deleted_at`) VALUES
(1, 'arroz', 1200.00, NULL, 12, 12, 1, '2025-10-06 16:30:11', '2025-10-06 16:30:11', 1, NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('glYQymsTWFOr7JmzgJ3rgWtkTdqIfNv8t604YHh8', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'ZXlKcGRpSTZJblV3V2tnMFFYWnhMM0ZwTnpaT2FHa3ZlRFJhY1hjOVBTSXNJblpoYkhWbElqb2lNMjA1YVRsNlowY3ZXVm95WlNzNVkxbE5RV0poYUhkNmFsUnpRV3g1Y21kcldVSjFObEo1VVRjeVVUSkxZV04xZDFwcFRrTlRhalZ2VUhBM2NGbG9WbGg1YzJacE1YSlVkV2s0V0hkbWNrRmhjRmhaUmxRdlV6RnphMU0zTjBwdFMyYzRUM0pyY2swMk5GUnNjVkZ0YzB0cFJWcHdSbGhrYTA5M1VUQnVjVzVGVVVka2ExbElhazgyWVZOVWR6TjVZelY0TlZaVmFVZ3hTR1ZYWkhkRlQweDNORmRzVW1kSVNVOVRhbVZ1Unk4ME0zVkxla0pMYzNsWmF6VklRMnhNUlRSRFQwTllOMUZJUnl0RksxZHVjV29yUlVFNVIxZEtVMU4wUzAwdlRXNTNWWFJOWm5keVF6Wk9jMkp5Y1U1d1FtbzRPR040WWsxM2JWUXJiazFoZVdoMkx6ZGxlRFJpTkM5cFpHaFBlVmhPVnk5c1NXSm1kMUZtVmtsWFFXdDJUSFV5VG5VMFdXUTNObFJJYXpBMGFHZDNlRUppUjJ4VGQzQkthMWhXTlV0Qk4waEJkRFJsTWtzMk4wdFJZMmxZTWpGdEwwZFdZeko1WVhCblduRXlZM1JSU2pRdk5tVXJRV2RSTVZGTVV6WXZiMGxUTW5ka1lXcDRZMEZ6VTNGT2IyazNSWEZOUWxSMllsQjNaVFpST0dWdmVYWnZaQzlpUTI1UlJIaFFSa2x3UlhkV1JVNUdRUzlzV25OdVNXUmtjMk5hZEc0ekwxYzJhbEo1TTB4eU5DSXNJbTFoWXlJNklqZzFPR0U0TUdZNE9UYzBZbVptWXpJd1ptRmlOREV3WkRRd016QTFaREl6TnpnNU56Y3hOMkk0WW1Zd05UWmlOakF5TVRCaFptTXpZVEptWTJFM1lqUWlMQ0owWVdjaU9pSWlmUT09', 1759757916),
('KVDR6Ae4JtUYGknzNp82cdkLCzCNh65MhZ6DnbRe', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'ZXlKcGRpSTZJa1ZYWVVGR2JYZHVMekJ6UTNoelRHVjFMMlpHWkZFOVBTSXNJblpoYkhWbElqb2lXbkpqZFhWSVUwRmFZM2h0VjBabVRqRmhUMDFYVGtaV1pHRlhUMmQ2YzIxdGVGQkZLMk5sTVdKd2FrZEVTM1U0ZUdkNk9VMTJaSHB5WjI5SE1YRjFPV2QzVGpaSkwxTk1TMHRKVTBadVpUUlpUVEpDZFVoMlJXcDZTRXQzVGxWRFIyTldPR2xMZDJGT2QydENibkJYUzJaQ1VXeENabnA2VVRCbWNIRnJRamxUV0dkNFpUa3JVbTVGWWt4WGNUYzFibTVaVGtoaGRrWkpWbXh6TmpsblNFMTVNbEZXVDNNdmNrWlJUMWRvTTB3ekwzQk1WalI2V204eWNEUnhibEJMTjJwWlpsWk9ORVoxTjA5aVQybHlOSGhqVFRoRWRHSTRjamdyTkV0dGVIVTVhMFZ6VjNodE9HVTBPVTFCUlZvMkwyVkdPR015Wm5GeFZ6SnBNRnBGZFdwdldHOVBOVXByVkM5YVQxWTFNbVJFUmtkTmFVaHhiREUwYWpkbVIwNVpNMGhsY1RsYVUxVktXR005SWl3aWJXRmpJam9pWldJMU5UYzRObVE1WkRVellXUXpOMlJpTldOalpURTJaV013WXpFek5USTNaamczWWpZMU1EbGxNVFl6TnpRNU1Ua3paVGd5WldRek16WTVOakppWXlJc0luUmhaeUk2SWlKOQ==', 1759757901),
('U8lJkEKl7C5zUgQOMgxs0jYnGwnRY0mUnCM1vXWc', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'ZXlKcGRpSTZJalpKT0RSUU0wTlRTemhvU2xkT2IwOVhUa1ZEWlVFOVBTSXNJblpoYkhWbElqb2ljVTF3Y21SbVdWVnVabWRtZG1SQlZIaDFTVU5HWmpSTkwxVmxUalJyUkRNcldHTmFLMFl4TXpKMVNHNXVNbFoyZG1aa1JrdFlPRlpFUzNGQ2FEWjBPVmt2TW1kRmJFeFZWVFkwTTFWaWIxQnFSMVpaYkUxQ1dIQjFRVkptYUd0V1lYVklUMEYyUVVzMVUwdHNXR2hDVDFKdVdIUTVPQ3RUUTNOMmFIUk1URTVRTlhoU2NVdEhNbGczY1RBeFRHOUxVblUxVUZGeVQxRTRObkp1ZEZoekwxbFpUMUkyZUV0M2NteHpkak5JU2pCVGRtTk5hemN4V0VrM1JDdENiVXBPU25wcWRWbFZVMFpzUkdoclIzRmpTak5aZGxKU0syUnhORmxGTldGWU1tOXlXVkppTmtJdmVHSTNOR3BuVEhWR1ZWUjNSakphWlZKa2FrTlFaMWxXVVZCSmMyaFVXbWRwUlN0alJ6QjBTMW81TTNVMVVGWkdNazlyUkU4MVJuSTVOVXBpV25STmJTdFFVbk05SWl3aWJXRmpJam9pTVdKbU1EQTRPRFpqTWprelpXUXdPVFJrWVdZeE1XWTRZamRtWTJVeU5HRmpOak01T1RFNE5XRmtaakF4TTJWaU16RTROVEpoTkRneU9EQXhNREk1WkNJc0luUmhaeUk2SWlKOQ==', 1759757917),
('wAsmwgGq6aM1OktsmJ2UhrsOrERjAwG4c4myrTfa', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'ZXlKcGRpSTZJakJYZDI5SWRVbG5NMDUwWXpJMFlsaERhWEpSYVdjOVBTSXNJblpoYkhWbElqb2lXR1ppUm1ab1JsTnlMekJtUnl0V1IzUnZZMnRMYTJoTFIwVlpiRkpIV0ZWNVJYQkRZVmxIVTFaRlRHaENTRWNyZVRsMWNXWlFaRXBGT1dwSmFsVjJPRlpDZFZkVVJ6Vk1WM2RaTUZwaldFSlFNMGw2U0dWM09EVlpjMUJNUW1GbVZVMTNaVVJzWnk4elIyeDVUR1pQU2k5U1EwSXJVbUZXYm1OVFprVXpXalFyTDFSUVVWbGllWGg0YVhKeGJWQnpaRlpTY0RkcGEwWnRTbmh2WVhwYWJuTXdUVzFpYWt4U1NuWnhOVU4zUlZock4wWTBkR2Q2YWt0S09HSnZXWEJGZG5WRmQwRlFVelpuWWpCRlEwcDZkazQxVERCUk9WVnJNWHBYWnpaTE9HdE1SbUZzUmtkRGNVSmxNVUZvWmpGRVpYRndUWEE0V25wcWIySk9jQ3RGWm1KdU1GQTFkMFYwVEVaT2RYVklNMnB4WVVKamRrMVFUWE5HZHpZMmFVWkVVSEZ6WmtnMmJubHpkbk16U3k5RkwzUXhSbTFzYkdaS1NGTkZRWFYxWlZKTlprZzBWMWhZUmk5RldUVjBZbGhFUkM5VVpuUndXbU5ZYUVkVFdHZExUWG93UjBsUVRtaFFaazFLUm5ObmFIVTRkVnBGUkVGTk9DdEZWRGxIYUZKbklpd2liV0ZqSWpvaU1XWTVZemhtTW1OaU5EUmtZV0V4TURaaFpERTJZak01TW1OaE5Ua3paVFV3TVdGbU56SXpOVFptTnpZME5qRTBOMkl6WmpGaE56QTNPR1ZrWWprMFppSXNJblJoWnlJNklpSjk=', 1759757901),
('xa0vpVlfchI6urUSiE30GnKgMgLHizNYbr8x5KqC', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', 'ZXlKcGRpSTZJbGhpVVdad2ExZFNlSElyTVRaMVJsTkljbFpzWm1jOVBTSXNJblpoYkhWbElqb2liV2hKTlVzd2VrUjZOM2hHUVRSbVFXeHBaRkZRYVc5bFowTnZlVEJ5VDFGWE9FZGthVk5MU0V0eGJVOVJVRzlsUmpCNGFFbHRhbGRSU1VWMlVGZHJNWEEwVGs5TlNDdFNValJETTBOdlZWSlhkVE5tY0ZaellVTlNaWEpPV1hSWFNVOHlZbTVQU0hoSGJqaHRlRGRVVTBod05uRlFiR3RKTDJkcU0yZG9lR3AzWjBkYUwxSkpia0Y1WWpsMVpIcG5TRGt6VFcwclFqWmhkRUp3ZGtnck1UQnllR05VVEV4aU5YUmlXR3RKYWpKR1dIUlZOa0pKYldrNUswRmFaMngzVldwblFtSmtabFpxYWtGcGIwcG1jSEYxY25JM1pteFFZMHROTjFaQlRVRk9OVTl3V1dGbVpFOHlTVEUyYlhCUFRHZGtRbTVtTVVoMlFVSkpPRmxVZGtSNFZsUk9hMGxGSzNneVJHTlRRVTVSV1dzMmJqbHVOa0ppWkZsd1EwTnlSMmgwUjI5bmRYSnVTVUU5SWl3aWJXRmpJam9pWlRkaVpUQXhObVprTm1Oa1lXSmlOamswTTJJNU1UYzNaR0UwTTJOaFpERTJPV1l4WXprME1tVXlNalV3T1RsaE5qWTBaVEV4WXpWa1lUZzNNalV4T0NJc0luUmhaeUk2SWlKOQ==', 1759757901);

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuario`
--

CREATE TABLE `usuario` (
  `id` bigint UNSIGNED NOT NULL,
  `NOME` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `EMAIL` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `SENHA_HASH` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `PERFIL` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `usuario`
--

INSERT INTO `usuario` (`id`, `NOME`, `EMAIL`, `SENHA_HASH`, `PERFIL`, `created_at`, `updated_at`, `deleted_at`, `email_verified_at`, `remember_token`) VALUES
(1, 'pablo', 'pbraz0460@gmail.com', '$2y$12$uNE7L.j2XitrtS3xEerscOHeeT3SOSjqf/wm8hso6m6Hj3KB4oddy', 'PABLO', '2025-10-06 16:27:24', '2025-10-06 16:27:24', NULL, NULL, 'wuJkfSrTBG3Oxhnbm7jEoQGWHcT3Y2VwDsoBcASJPbM3Xi9bukSj969ijla7');

-- --------------------------------------------------------

--
-- Estrutura da tabela `vendas`
--

CREATE TABLE `vendas` (
  `id` bigint UNSIGNED NOT NULL,
  `usuario_id` bigint UNSIGNED NOT NULL,
  `cliente_id` bigint UNSIGNED DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `desconto` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `forma_pagamento` enum('dinheiro','pix','cartao_debito','cartao_credito','conta_fiada') COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor_recebido` decimal(10,2) DEFAULT NULL,
  `troco` decimal(10,2) DEFAULT NULL,
  `status` enum('pendente','concluida','cancelada','conta_fiada') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendente',
  `observacoes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `vendas`
--

INSERT INTO `vendas` (`id`, `usuario_id`, `cliente_id`, `subtotal`, `desconto`, `total`, `forma_pagamento`, `valor_recebido`, `troco`, `status`, `observacoes`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1200.00, 0.00, 1200.00, 'conta_fiada', 0.00, NULL, 'conta_fiada', NULL, '2025-10-06 16:32:52', '2025-10-06 16:32:52'),
(2, 1, 1, 12000.00, 0.00, 12000.00, 'conta_fiada', 120.00, NULL, 'conta_fiada', NULL, '2025-10-06 16:36:30', '2025-10-06 16:36:30');

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Índices para tabela `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Índices para tabela `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categoria_comercio_nome_unique` (`comercio_id`,`nome`),
  ADD KEY `categoria_comercio_idx` (`comercio_id`);

--
-- Índices para tabela `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cliente_email_unique` (`email`),
  ADD KEY `cliente_comercio_id_foreign` (`comercio_id`);

--
-- Índices para tabela `comercio`
--
ALTER TABLE `comercio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `comercio_cnpj_unique` (`cnpj`),
  ADD KEY `comercio_usuario_id_foreign` (`usuario_id`);

--
-- Índices para tabela `conta_fiada`
--
ALTER TABLE `conta_fiada`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `conta_fiada_cliente_id_comercio_id_unique` (`cliente_id`,`comercio_id`),
  ADD KEY `conta_fiada_cliente_id_index` (`cliente_id`),
  ADD KEY `conta_fiada_comercio_id_index` (`comercio_id`);

--
-- Índices para tabela `estoque`
--
ALTER TABLE `estoque`
  ADD PRIMARY KEY (`id`),
  ADD KEY `estoque_comercio_id_foreign` (`comercio_id`),
  ADD KEY `estoque_produto_id_foreign` (`produto_id`);

--
-- Índices para tabela `historico_de_pagamento`
--
ALTER TABLE `historico_de_pagamento`
  ADD PRIMARY KEY (`id`),
  ADD KEY `historico_de_pagamento_comercio_id_foreign` (`comercio_id`),
  ADD KEY `historico_de_pagamento_conta_fiada_id_foreign` (`conta_fiada_id`);

--
-- Índices para tabela `itens_venda`
--
ALTER TABLE `itens_venda`
  ADD PRIMARY KEY (`id`),
  ADD KEY `itens_venda_venda_id_index` (`venda_id`),
  ADD KEY `itens_venda_produto_id_index` (`produto_id`);

--
-- Índices para tabela `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Índices para tabela `movimentos_estoque`
--
ALTER TABLE `movimentos_estoque`
  ADD PRIMARY KEY (`id`),
  ADD KEY `movimentos_estoque_usuario_id_foreign` (`usuario_id`),
  ADD KEY `movimentos_estoque_produto_id_tipo_index` (`produto_id`,`tipo`),
  ADD KEY `movimentos_estoque_venda_id_index` (`venda_id`),
  ADD KEY `movimentos_estoque_created_at_index` (`created_at`);

--
-- Índices para tabela `produto`
--
ALTER TABLE `produto`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `produto_comercio_nome_deleted_unique` (`comercio_id`,`nome`,`deleted_at`),
  ADD KEY `produto_categoria_id_foreign` (`categoria_id`);

--
-- Índices para tabela `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Índices para tabela `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_email_unique` (`EMAIL`),
  ADD KEY `usuario_email_index` (`EMAIL`),
  ADD KEY `usuario_perfil_index` (`PERFIL`),
  ADD KEY `usuario_created_at_index` (`created_at`);

--
-- Índices para tabela `vendas`
--
ALTER TABLE `vendas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendas_usuario_id_status_index` (`usuario_id`,`status`),
  ADD KEY `vendas_cliente_id_index` (`cliente_id`),
  ADD KEY `vendas_created_at_index` (`created_at`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `comercio`
--
ALTER TABLE `comercio`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `conta_fiada`
--
ALTER TABLE `conta_fiada`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `estoque`
--
ALTER TABLE `estoque`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `historico_de_pagamento`
--
ALTER TABLE `historico_de_pagamento`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `itens_venda`
--
ALTER TABLE `itens_venda`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de tabela `movimentos_estoque`
--
ALTER TABLE `movimentos_estoque`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `produto`
--
ALTER TABLE `produto`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `vendas`
--
ALTER TABLE `vendas`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `categoria`
--
ALTER TABLE `categoria`
  ADD CONSTRAINT `categoria_comercio_id_foreign` FOREIGN KEY (`comercio_id`) REFERENCES `comercio` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `cliente`
--
ALTER TABLE `cliente`
  ADD CONSTRAINT `cliente_comercio_id_foreign` FOREIGN KEY (`comercio_id`) REFERENCES `comercio` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `comercio`
--
ALTER TABLE `comercio`
  ADD CONSTRAINT `comercio_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `conta_fiada`
--
ALTER TABLE `conta_fiada`
  ADD CONSTRAINT `conta_fiada_cliente_id_foreign` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conta_fiada_comercio_id_foreign` FOREIGN KEY (`comercio_id`) REFERENCES `comercio` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `estoque`
--
ALTER TABLE `estoque`
  ADD CONSTRAINT `estoque_comercio_id_foreign` FOREIGN KEY (`comercio_id`) REFERENCES `comercio` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `estoque_produto_id_foreign` FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `historico_de_pagamento`
--
ALTER TABLE `historico_de_pagamento`
  ADD CONSTRAINT `historico_de_pagamento_comercio_id_foreign` FOREIGN KEY (`comercio_id`) REFERENCES `comercio` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `historico_de_pagamento_conta_fiada_id_foreign` FOREIGN KEY (`conta_fiada_id`) REFERENCES `conta_fiada` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `itens_venda`
--
ALTER TABLE `itens_venda`
  ADD CONSTRAINT `itens_venda_produto_id_foreign` FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `itens_venda_venda_id_foreign` FOREIGN KEY (`venda_id`) REFERENCES `vendas` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `movimentos_estoque`
--
ALTER TABLE `movimentos_estoque`
  ADD CONSTRAINT `movimentos_estoque_produto_id_foreign` FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `movimentos_estoque_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `movimentos_estoque_venda_id_foreign` FOREIGN KEY (`venda_id`) REFERENCES `vendas` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `produto`
--
ALTER TABLE `produto`
  ADD CONSTRAINT `produto_categoria_id_foreign` FOREIGN KEY (`categoria_id`) REFERENCES `categoria` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `produto_comercio_id_foreign` FOREIGN KEY (`comercio_id`) REFERENCES `comercio` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `usuario` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `vendas`
--
ALTER TABLE `vendas`
  ADD CONSTRAINT `vendas_cliente_id_foreign` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `vendas_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
