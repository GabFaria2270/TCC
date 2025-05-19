-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 24/04/2025 às 17:32
-- Versão do servidor: 8.0.30
-- Versão do PHP: 8.3.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `teste`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `categoria`
--

CREATE TABLE `categoria` (
  `ID` int NOT NULL,
  `NOME` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cliente`
--

CREATE TABLE `cliente` (
  `ID` int NOT NULL,
  `NOME` varchar(100) NOT NULL,
  `CPF` varchar(14) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cliente_contato`
--

CREATE TABLE `cliente_contato` (
  `ID` int NOT NULL,
  `CLIENTE_ID` int NOT NULL,
  `TIPO` varchar(20) NOT NULL,
  `VALOR` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `conta_fiada`
--

CREATE TABLE `conta_fiada` (
  `ID` int NOT NULL,
  `CLIENTE_ID` int NOT NULL,
  `MERCEARIA_ID` int NOT NULL,
  `VALOR_DEVIDO` decimal(10,2) NOT NULL DEFAULT '0.00',
  `DATA_ULTIMA_ATUALIZACAO` date NOT NULL,
  `STATUS` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `estoque`
--

CREATE TABLE `estoque` (
  `ID` int NOT NULL,
  `MERCEARIA_ID` int NOT NULL,
  `PRODUTO_ID` int NOT NULL,
  `QUANTIDADE` int NOT NULL DEFAULT '0',
  `DATA_ENTRADA` date DEFAULT NULL,
  `DATA_SAIDA` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `forma_de_pagamento`
--

CREATE TABLE `forma_de_pagamento` (
  `ID` int NOT NULL,
  `DESCRICAO` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `historico_de_pagamento`
--

CREATE TABLE `historico_de_pagamento` (
  `ID` int NOT NULL,
  `CONTA_FIADA_ID` int NOT NULL,
  `DATA_PAGAMENTO` date NOT NULL,
  `VALOR_PAGO` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `item_venda`
--

CREATE TABLE `item_venda` (
  `VENDA_ID` int NOT NULL,
  `PRODUTO_ID` int NOT NULL,
  `QUANTIDADE` int NOT NULL DEFAULT '1',
  `PRECO_UNITARIO` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `mercearia`
--

CREATE TABLE `mercearia` (
  `ID` int NOT NULL,
  `NOME` varchar(100) NOT NULL,
  `ENDERECO` varchar(255) DEFAULT NULL,
  `CONTATO` varchar(50) DEFAULT NULL,
  `USUARIO_ID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `produto`
--

CREATE TABLE `produto` (
  `ID` int NOT NULL,
  `NOME` varchar(100) NOT NULL,
  `PRECO` decimal(10,2) NOT NULL,
  `DESCRICAO` varchar(255) DEFAULT NULL,
  `CATEGORIA_ID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuario`
--

CREATE TABLE `usuario` (
  `ID` int NOT NULL,
  `NOME` varchar(100) NOT NULL,
  `EMAIL` varchar(150) NOT NULL,
  `SENHA_HASH` varchar(255) NOT NULL,
  `PERFIL` varchar(50) NOT NULL,
  `DATA_CRIACAO` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `venda`
--

CREATE TABLE `venda` (
  `ID` int NOT NULL,
  `DATA` date NOT NULL,
  `CLIENTE_ID` int NOT NULL,
  `MERCEARIA_ID` int NOT NULL,
  `FORMA_DE_PAGAMENTO_ID` int NOT NULL,
  `TOTAL` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`ID`);

--
-- Índices de tabela `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `CPF` (`CPF`);

--
-- Índices de tabela `cliente_contato`
--
ALTER TABLE `cliente_contato`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idx_contato_cliente` (`CLIENTE_ID`);

--
-- Índices de tabela `conta_fiada`
--
ALTER TABLE `conta_fiada`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idx_contafiada_cliente` (`CLIENTE_ID`),
  ADD KEY `idx_contafiada_mercearia` (`MERCEARIA_ID`);

--
-- Índices de tabela `estoque`
--
ALTER TABLE `estoque`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idx_estoque_mercearia` (`MERCEARIA_ID`),
  ADD KEY `idx_estoque_produto` (`PRODUTO_ID`);

--
-- Índices de tabela `forma_de_pagamento`
--
ALTER TABLE `forma_de_pagamento`
  ADD PRIMARY KEY (`ID`);

--
-- Índices de tabela `historico_de_pagamento`
--
ALTER TABLE `historico_de_pagamento`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idx_histpag_contafiada` (`CONTA_FIADA_ID`);

--
-- Índices de tabela `item_venda`
--
ALTER TABLE `item_venda`
  ADD PRIMARY KEY (`VENDA_ID`,`PRODUTO_ID`),
  ADD KEY `idx_itemvenda_produto` (`PRODUTO_ID`);

--
-- Índices de tabela `mercearia`
--
ALTER TABLE `mercearia`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idx_mercearia_usuario` (`USUARIO_ID`);

--
-- Índices de tabela `produto`
--
ALTER TABLE `produto`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idx_produto_categoria` (`CATEGORIA_ID`);

--
-- Índices de tabela `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `EMAIL` (`EMAIL`);

--
-- Índices de tabela `venda`
--
ALTER TABLE `venda`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `idx_venda_cliente` (`CLIENTE_ID`),
  ADD KEY `idx_venda_mercearia` (`MERCEARIA_ID`),
  ADD KEY `idx_venda_pagamento` (`FORMA_DE_PAGAMENTO_ID`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `categoria`
--
ALTER TABLE `categoria`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `cliente`
--
ALTER TABLE `cliente`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `cliente_contato`
--
ALTER TABLE `cliente_contato`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `conta_fiada`
--
ALTER TABLE `conta_fiada`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `estoque`
--
ALTER TABLE `estoque`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `forma_de_pagamento`
--
ALTER TABLE `forma_de_pagamento`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `historico_de_pagamento`
--
ALTER TABLE `historico_de_pagamento`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `mercearia`
--
ALTER TABLE `mercearia`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `produto`
--
ALTER TABLE `produto`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `usuario`
--
ALTER TABLE `usuario`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `venda`
--
ALTER TABLE `venda`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `cliente_contato`
--
ALTER TABLE `cliente_contato`
  ADD CONSTRAINT `cliente_contato_ibfk_1` FOREIGN KEY (`CLIENTE_ID`) REFERENCES `cliente` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `conta_fiada`
--
ALTER TABLE `conta_fiada`
  ADD CONSTRAINT `conta_fiada_ibfk_1` FOREIGN KEY (`CLIENTE_ID`) REFERENCES `cliente` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `conta_fiada_ibfk_2` FOREIGN KEY (`MERCEARIA_ID`) REFERENCES `mercearia` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `estoque`
--
ALTER TABLE `estoque`
  ADD CONSTRAINT `estoque_ibfk_1` FOREIGN KEY (`MERCEARIA_ID`) REFERENCES `mercearia` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `estoque_ibfk_2` FOREIGN KEY (`PRODUTO_ID`) REFERENCES `produto` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `historico_de_pagamento`
--
ALTER TABLE `historico_de_pagamento`
  ADD CONSTRAINT `historico_de_pagamento_ibfk_1` FOREIGN KEY (`CONTA_FIADA_ID`) REFERENCES `conta_fiada` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `item_venda`
--
ALTER TABLE `item_venda`
  ADD CONSTRAINT `item_venda_ibfk_1` FOREIGN KEY (`VENDA_ID`) REFERENCES `venda` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `item_venda_ibfk_2` FOREIGN KEY (`PRODUTO_ID`) REFERENCES `produto` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `mercearia`
--
ALTER TABLE `mercearia`
  ADD CONSTRAINT `mercearia_ibfk_1` FOREIGN KEY (`USUARIO_ID`) REFERENCES `usuario` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `produto`
--
ALTER TABLE `produto`
  ADD CONSTRAINT `produto_ibfk_1` FOREIGN KEY (`CATEGORIA_ID`) REFERENCES `categoria` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Restrições para tabelas `venda`
--
ALTER TABLE `venda`
  ADD CONSTRAINT `venda_ibfk_1` FOREIGN KEY (`CLIENTE_ID`) REFERENCES `cliente` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `venda_ibfk_2` FOREIGN KEY (`MERCEARIA_ID`) REFERENCES `mercearia` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `venda_ibfk_3` FOREIGN KEY (`FORMA_DE_PAGAMENTO_ID`) REFERENCES `forma_de_pagamento` (`ID`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
