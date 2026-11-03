-- MySQL dump 10.13  Distrib 8.4.11, for Linux (x86_64)
--
-- Host: localhost    Database: station_service
-- ------------------------------------------------------
-- Server version	8.4.11-0ubuntu0.26.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `achatessence`
--

DROP TABLE IF EXISTS `achatessence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achatessence` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `fournisseurId` int NOT NULL,
  `type` enum('achat','retour') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'achat',
  `reference` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `magasinId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `AchatEssence_date_fournisseurId_idx` (`date`,`fournisseurId`),
  KEY `AchatEssence_fournisseurId_fkey` (`fournisseurId`),
  KEY `AchatEssence_magasinId_idx` (`magasinId`),
  CONSTRAINT `AchatEssence_fournisseurId_fkey` FOREIGN KEY (`fournisseurId`) REFERENCES `fournisseur` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `AchatEssence_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `achatprod`
--

DROP TABLE IF EXISTS `achatprod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achatprod` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fournisseurId` int NOT NULL,
  `dateAchat` date NOT NULL,
  `numFacture` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dateFacture` date DEFAULT NULL,
  `totalTTC` decimal(15,3) NOT NULL,
  `totHT` decimal(15,3) NOT NULL,
  `reste` decimal(15,3) NOT NULL DEFAULT '0.000',
  `numRegFour` int DEFAULT NULL,
  `valide` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `magasinId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `AchatProd_fournisseurId_dateAchat_idx` (`fournisseurId`,`dateAchat`),
  KEY `AchatProd_magasinId_idx` (`magasinId`),
  CONSTRAINT `AchatProd_fournisseurId_fkey` FOREIGN KEY (`fournisseurId`) REFERENCES `fournisseur` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `AchatProd_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ageocomptemode`
--

DROP TABLE IF EXISTS `ageocomptemode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ageocomptemode` (
  `banqueId` int NOT NULL,
  `modePaymentId` int NOT NULL,
  `tauxCommission` decimal(15,3) NOT NULL DEFAULT '0.000',
  `nbrJoursCompensation` int NOT NULL DEFAULT '0',
  `tvaCom` decimal(15,3) NOT NULL DEFAULT '0.000',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`banqueId`,`modePaymentId`),
  KEY `AgeoCompteMode_modePaymentId_idx` (`modePaymentId`),
  CONSTRAINT `AgeoCompteMode_banqueId_fkey` FOREIGN KEY (`banqueId`) REFERENCES `banque` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AgeoCompteMode_modePaymentId_fkey` FOREIGN KEY (`modePaymentId`) REFERENCES `modepayment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `banque`
--

DROP TABLE IF EXISTS `banque`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banque` (
  `id` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tel` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rib` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Banque_libelle_idx` (`libelle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bonliv`
--

DROP TABLE IF EXISTS `bonliv`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bonliv` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `clientId` int NOT NULL,
  `totalHT` decimal(15,3) NOT NULL DEFAULT '0.000',
  `totalTTC` decimal(15,3) NOT NULL DEFAULT '0.000',
  `totTVA` decimal(15,3) NOT NULL DEFAULT '0.000',
  `numFact` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `magasinId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Bonliv_numFact_key` (`numFact`),
  KEY `Bonliv_date_clientId_idx` (`date`,`clientId`),
  KEY `Bonliv_clientId_fkey` (`clientId`),
  KEY `Bonliv_magasinId_idx` (`magasinId`),
  CONSTRAINT `Bonliv_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Bonliv_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bonsstation`
--

DROP TABLE IF EXISTS `bonsstation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bonsstation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numBord` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bonStationId` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` date NOT NULL,
  `montant` decimal(15,3) NOT NULL,
  `numFacture` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fait` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `BonsStation_date_fait_idx` (`date`,`fait`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `caisse`
--

DROP TABLE IF EXISTS `caisse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `caisse` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `magasinId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Caisse_code_key` (`code`),
  KEY `Caisse_actif_idx` (`actif`),
  KEY `Caisse_magasinId_idx` (`magasinId`),
  CONSTRAINT `Caisse_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `carprodsiege`
--

DROP TABLE IF EXISTS `carprodsiege`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carprodsiege` (
  `id` int NOT NULL AUTO_INCREMENT,
  `produitId` int NOT NULL,
  `fournisseurId` int DEFAULT NULL,
  `date` date NOT NULL,
  `equipeId` int NOT NULL,
  `caisseId` int NOT NULL,
  `vendeurId` int NOT NULL,
  `numVente` int NOT NULL,
  `prixAchatHT` decimal(15,3) NOT NULL,
  `prixVenteHT` decimal(15,3) NOT NULL,
  `prixVenteTTC` decimal(15,3) NOT NULL,
  `prixAchatTTC` decimal(15,3) NOT NULL,
  `quantite` decimal(15,3) NOT NULL,
  `tva` decimal(15,3) NOT NULL,
  `marge` decimal(15,3) NOT NULL,
  `codeFamille` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `typeCarburant` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pompeId` int DEFAULT NULL,
  `numLigne` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `CarProdSiege_date_equipeId_caisseId_idx` (`date`,`equipeId`,`caisseId`),
  KEY `CarProdSiege_produitId_date_idx` (`produitId`,`date`),
  KEY `CarProdSiege_fournisseurId_fkey` (`fournisseurId`),
  KEY `CarProdSiege_equipeId_fkey` (`equipeId`),
  KEY `CarProdSiege_caisseId_fkey` (`caisseId`),
  KEY `CarProdSiege_vendeurId_fkey` (`vendeurId`),
  KEY `CarProdSiege_pompeId_fkey` (`pompeId`),
  CONSTRAINT `CarProdSiege_caisseId_fkey` FOREIGN KEY (`caisseId`) REFERENCES `caisse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `CarProdSiege_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipe` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `CarProdSiege_fournisseurId_fkey` FOREIGN KEY (`fournisseurId`) REFERENCES `fournisseur` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `CarProdSiege_pompeId_fkey` FOREIGN KEY (`pompeId`) REFERENCES `pompe` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `CarProdSiege_produitId_fkey` FOREIGN KEY (`produitId`) REFERENCES `produit` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `CarProdSiege_vendeurId_fkey` FOREIGN KEY (`vendeurId`) REFERENCES `vendeur` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cartes`
--

DROP TABLE IF EXISTS `cartes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cartes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numTicket` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numCession` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` date NOT NULL,
  `montant` decimal(15,3) NOT NULL,
  `numFacture` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `typeCarte` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fait` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Cartes_date_typeCarte_idx` (`date`,`typeCarte`),
  KEY `Cartes_fait_idx` (`fait`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `carwash`
--

DROP TABLE IF EXISTS `carwash`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carwash` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `indexOuverture` decimal(15,3) NOT NULL,
  `indexFermeture` decimal(15,3) NOT NULL,
  `nombreLavage` decimal(15,3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CarWash_date_key` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `client`
--

DROP TABLE IF EXISTS `client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nomClient` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MF` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quota` decimal(15,3) NOT NULL DEFAULT '0.000',
  `soldeAnterieur` decimal(15,3) NOT NULL DEFAULT '0.000',
  `tva` decimal(15,3) NOT NULL DEFAULT '0.000',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Client_nomClient_idx` (`nomClient`),
  KEY `Client_MF_idx` (`MF`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compteur`
--

DROP TABLE IF EXISTS `compteur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compteur` (
  `id` int NOT NULL DEFAULT '1',
  `lastNumBL` int NOT NULL DEFAULT '0',
  `lastNumFact` int NOT NULL DEFAULT '0',
  `lastNumAchatEss` int NOT NULL DEFAULT '0',
  `lastNumAchatProd` int NOT NULL DEFAULT '0',
  `lastNumDepense` int NOT NULL DEFAULT '0',
  `lastNumRecette` int NOT NULL DEFAULT '0',
  `lastNumCredit` int NOT NULL DEFAULT '0',
  `lastNumReg` int NOT NULL DEFAULT '0',
  `lastNumRegFour` int NOT NULL DEFAULT '0',
  `lastNumInvent` int NOT NULL DEFAULT '0',
  `lastNumInvCar` int NOT NULL DEFAULT '0',
  `lastNumTransfert` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `creditcaisse`
--

DROP TABLE IF EXISTS `creditcaisse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `creditcaisse` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `equipeId` int NOT NULL,
  `caisseId` int NOT NULL,
  `vendeurId` int NOT NULL,
  `totalCredits` decimal(15,3) NOT NULL DEFAULT '0.000',
  `fait` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `magasinId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CreditCaisse_date_equipeId_caisseId_key` (`date`,`equipeId`,`caisseId`),
  KEY `CreditCaisse_date_equipeId_caisseId_vendeurId_idx` (`date`,`equipeId`,`caisseId`,`vendeurId`),
  KEY `CreditCaisse_equipeId_fkey` (`equipeId`),
  KEY `CreditCaisse_caisseId_fkey` (`caisseId`),
  KEY `CreditCaisse_vendeurId_fkey` (`vendeurId`),
  KEY `CreditCaisse_magasinId_idx` (`magasinId`),
  CONSTRAINT `CreditCaisse_caisseId_fkey` FOREIGN KEY (`caisseId`) REFERENCES `caisse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `CreditCaisse_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipe` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `CreditCaisse_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `CreditCaisse_vendeurId_fkey` FOREIGN KEY (`vendeurId`) REFERENCES `vendeur` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cuve`
--

DROP TABLE IF EXISTS `cuve`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cuve` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `carburant` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `volumeTotal` decimal(15,3) NOT NULL,
  `stockInitial` decimal(15,3) NOT NULL DEFAULT '0.000',
  `seuilAlerte` decimal(15,3) NOT NULL DEFAULT '0.000',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `magasinId` int DEFAULT NULL,
  `stock` decimal(15,3) NOT NULL DEFAULT '0.000',
  `prixAchatHT` decimal(15,3) NOT NULL DEFAULT '0.000',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Cuve_code_key` (`code`),
  KEY `Cuve_carburant_idx` (`carburant`),
  KEY `Cuve_magasinId_idx` (`magasinId`),
  CONSTRAINT `Cuve_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `depenses`
--

DROP TABLE IF EXISTS `depenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `depenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `typeDepense` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numFamDep` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `famDepenseId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Depenses_typeDepense_idx` (`typeDepense`),
  KEY `Depenses_famDepenseId_idx` (`famDepenseId`),
  CONSTRAINT `Depenses_famDepenseId_fkey` FOREIGN KEY (`famDepenseId`) REFERENCES `famdepense` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `depensescaisse`
--

DROP TABLE IF EXISTS `depensescaisse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `depensescaisse` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `equipeId` int NOT NULL,
  `caisseId` int NOT NULL,
  `vendeurId` int NOT NULL,
  `totalDepenses` decimal(15,3) NOT NULL DEFAULT '0.000',
  `fait` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `magasinId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `DepensesCaisse_date_equipeId_caisseId_key` (`date`,`equipeId`,`caisseId`),
  KEY `DepensesCaisse_date_equipeId_caisseId_vendeurId_idx` (`date`,`equipeId`,`caisseId`,`vendeurId`),
  KEY `DepensesCaisse_equipeId_fkey` (`equipeId`),
  KEY `DepensesCaisse_caisseId_fkey` (`caisseId`),
  KEY `DepensesCaisse_vendeurId_fkey` (`vendeurId`),
  KEY `DepensesCaisse_magasinId_idx` (`magasinId`),
  CONSTRAINT `DepensesCaisse_caisseId_fkey` FOREIGN KEY (`caisseId`) REFERENCES `caisse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DepensesCaisse_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipe` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DepensesCaisse_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `DepensesCaisse_vendeurId_fkey` FOREIGN KEY (`vendeurId`) REFERENCES `vendeur` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detailachatessence`
--

DROP TABLE IF EXISTS `detailachatessence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detailachatessence` (
  `id` int NOT NULL AUTO_INCREMENT,
  `achatId` int NOT NULL,
  `cuveId` int NOT NULL,
  `quantite` decimal(15,3) NOT NULL,
  `prixUnitaire` decimal(15,3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `DetailAchatEssence_cuveId_createdAt_idx` (`cuveId`,`createdAt`),
  KEY `DetailAchatEssence_achatId_idx` (`achatId`),
  CONSTRAINT `DetailAchatEssence_achatId_fkey` FOREIGN KEY (`achatId`) REFERENCES `achatessence` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `DetailAchatEssence_cuveId_fkey` FOREIGN KEY (`cuveId`) REFERENCES `cuve` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detailachatprod`
--

DROP TABLE IF EXISTS `detailachatprod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detailachatprod` (
  `id` int NOT NULL AUTO_INCREMENT,
  `achatProdId` int NOT NULL,
  `produitId` int NOT NULL,
  `date` date NOT NULL,
  `quantite` decimal(15,3) NOT NULL,
  `prixAchat` decimal(15,3) NOT NULL,
  `tauxTVA` decimal(15,3) NOT NULL,
  `valide` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `DetailAchatProd_achatProdId_idx` (`achatProdId`),
  KEY `DetailAchatProd_produitId_date_idx` (`produitId`,`date`),
  CONSTRAINT `DetailAchatProd_achatProdId_fkey` FOREIGN KEY (`achatProdId`) REFERENCES `achatprod` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `DetailAchatProd_produitId_fkey` FOREIGN KEY (`produitId`) REFERENCES `produit` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detailcredit`
--

DROP TABLE IF EXISTS `detailcredit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detailcredit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numCredit` int NOT NULL,
  `clientId` int NOT NULL,
  `montant` decimal(15,3) NOT NULL,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modePayment` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `DetailCredit_numCredit_idx` (`numCredit`),
  KEY `DetailCredit_clientId_idx` (`clientId`),
  CONSTRAINT `DetailCredit_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DetailCredit_numCredit_fkey` FOREIGN KEY (`numCredit`) REFERENCES `creditcaisse` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detaildepenses`
--

DROP TABLE IF EXISTS `detaildepenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detaildepenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numDepense` int NOT NULL,
  `codeDepense` int NOT NULL,
  `libelle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `montant` decimal(15,3) NOT NULL DEFAULT '0.000',
  PRIMARY KEY (`id`),
  KEY `DetailDepenses_numDepense_idx` (`numDepense`),
  KEY `DetailDepenses_codeDepense_idx` (`codeDepense`),
  CONSTRAINT `DetailDepenses_codeDepense_fkey` FOREIGN KEY (`codeDepense`) REFERENCES `depenses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DetailDepenses_numDepense_fkey` FOREIGN KEY (`numDepense`) REFERENCES `depensescaisse` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detailinventairecarburant`
--

DROP TABLE IF EXISTS `detailinventairecarburant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detailinventairecarburant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inventaireCarId` int NOT NULL,
  `cuveId` int NOT NULL,
  `date` date NOT NULL,
  `stockPhysique` decimal(15,3) NOT NULL,
  `stockComptable` decimal(15,3) NOT NULL,
  `prixUnitaire` decimal(15,3) NOT NULL,
  `valeur` decimal(15,3) NOT NULL,
  `ecart` decimal(15,3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `DetailInventaireCarburant_inventaireCarId_cuveId_key` (`inventaireCarId`,`cuveId`),
  KEY `DetailInventaireCarburant_date_cuveId_idx` (`date`,`cuveId`),
  KEY `DetailInventaireCarburant_cuveId_fkey` (`cuveId`),
  CONSTRAINT `DetailInventaireCarburant_cuveId_fkey` FOREIGN KEY (`cuveId`) REFERENCES `cuve` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DetailInventaireCarburant_inventaireCarId_fkey` FOREIGN KEY (`inventaireCarId`) REFERENCES `inventairecarburant` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detailrecettecaisse`
--

DROP TABLE IF EXISTS `detailrecettecaisse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detailrecettecaisse` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numRecette` int NOT NULL,
  `modePaymentId` int NOT NULL,
  `montant` decimal(15,3) NOT NULL,
  `numero` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `idCuve` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `vehiculeId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `DetailRecetteCaisse_numRecette_idx` (`numRecette`),
  KEY `DetailRecetteCaisse_modePaymentId_idx` (`modePaymentId`),
  KEY `DetailRecetteCaisse_idCuve_idx` (`idCuve`),
  CONSTRAINT `DetailRecetteCaisse_idCuve_fkey` FOREIGN KEY (`idCuve`) REFERENCES `cuve` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DetailRecetteCaisse_modePaymentId_fkey` FOREIGN KEY (`modePaymentId`) REFERENCES `modepayment` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DetailRecetteCaisse_numRecette_fkey` FOREIGN KEY (`numRecette`) REFERENCES `recettecaisse` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detailregfour`
--

DROP TABLE IF EXISTS `detailregfour`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detailregfour` (
  `id` int NOT NULL AUTO_INCREMENT,
  `regFourId` int NOT NULL,
  `nLigne` int NOT NULL,
  `numAchats` int DEFAULT NULL,
  `proEss` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `montant` decimal(15,3) NOT NULL,
  `modePayment` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `echeance` date DEFAULT NULL,
  `reste` decimal(15,3) NOT NULL DEFAULT '0.000',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `DetailRegFour_regFourId_nLigne_key` (`regFourId`,`nLigne`),
  KEY `DetailRegFour_numAchats_idx` (`numAchats`),
  CONSTRAINT `DetailRegFour_numAchats_fkey` FOREIGN KEY (`numAchats`) REFERENCES `achatessence` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DetailRegFour_regFourId_fkey` FOREIGN KEY (`regFourId`) REFERENCES `regfour` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detailreglements`
--

DROP TABLE IF EXISTS `detailreglements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detailreglements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clientId` int NOT NULL,
  `equipeId` int NOT NULL,
  `caisseId` int NOT NULL,
  `date` date NOT NULL,
  `montant` decimal(15,3) NOT NULL,
  `modePayment` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `echeance` date DEFAULT NULL,
  `impaye` tinyint(1) NOT NULL DEFAULT '0',
  `valide` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `DetailReglements_clientId_date_idx` (`clientId`,`date`),
  KEY `DetailReglements_equipeId_caisseId_date_idx` (`equipeId`,`caisseId`,`date`),
  KEY `DetailReglements_impaye_echeance_idx` (`impaye`,`echeance`),
  KEY `DetailReglements_caisseId_fkey` (`caisseId`),
  CONSTRAINT `DetailReglements_caisseId_fkey` FOREIGN KEY (`caisseId`) REFERENCES `caisse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DetailReglements_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DetailReglements_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipe` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detailretour`
--

DROP TABLE IF EXISTS `detailretour`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detailretour` (
  `id` int NOT NULL AUTO_INCREMENT,
  `retourCuveId` int NOT NULL,
  `pompeId` int NOT NULL,
  `cuveId` int NOT NULL,
  `volume` decimal(15,3) NOT NULL,
  `valeur` decimal(15,3) NOT NULL,
  `tauxTVA` decimal(5,2) NOT NULL,
  `valide` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `DetailRetour_retourCuveId_fkey` (`retourCuveId`),
  KEY `DetailRetour_pompeId_fkey` (`pompeId`),
  KEY `DetailRetour_cuveId_fkey` (`cuveId`),
  CONSTRAINT `DetailRetour_cuveId_fkey` FOREIGN KEY (`cuveId`) REFERENCES `cuve` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DetailRetour_pompeId_fkey` FOREIGN KEY (`pompeId`) REFERENCES `pompe` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DetailRetour_retourCuveId_fkey` FOREIGN KEY (`retourCuveId`) REFERENCES `retourcuve` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detbonliv`
--

DROP TABLE IF EXISTS `detbonliv`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detbonliv` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numLigne` int NOT NULL,
  `bonlivId` int NOT NULL,
  `idProduit` int NOT NULL,
  `puHT` decimal(15,3) NOT NULL,
  `tva` decimal(15,3) NOT NULL,
  `qte` decimal(15,3) NOT NULL,
  `remise` decimal(15,3) NOT NULL DEFAULT '0.000',
  `ttc` decimal(15,3) NOT NULL,
  `date` date NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Detbonliv_bonlivId_numLigne_key` (`bonlivId`,`numLigne`),
  KEY `Detbonliv_idProduit_date_idx` (`idProduit`,`date`),
  CONSTRAINT `Detbonliv_bonlivId_fkey` FOREIGN KEY (`bonlivId`) REFERENCES `bonliv` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Detbonliv_idProduit_fkey` FOREIGN KEY (`idProduit`) REFERENCES `produit` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detentretien`
--

DROP TABLE IF EXISTS `detentretien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detentretien` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entretienId` int NOT NULL,
  `idService` int DEFAULT NULL,
  `prixHT` decimal(15,3) NOT NULL,
  `prixTTC` decimal(15,3) NOT NULL,
  `numLigne` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `serviceId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Detentretien_entretienId_numLigne_key` (`entretienId`,`numLigne`),
  KEY `Detentretien_idService_idx` (`idService`),
  KEY `Detentretien_serviceId_idx` (`serviceId`),
  CONSTRAINT `Detentretien_entretienId_fkey` FOREIGN KEY (`entretienId`) REFERENCES `entretien` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Detentretien_idService_fkey` FOREIGN KEY (`idService`) REFERENCES `produit` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Detentretien_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `service` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detfact`
--

DROP TABLE IF EXISTS `detfact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detfact` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numLigne` int NOT NULL,
  `factureId` int NOT NULL,
  `idProduit` int NOT NULL,
  `puHT` decimal(15,3) NOT NULL,
  `qte` decimal(15,3) NOT NULL,
  `ttc` decimal(15,3) NOT NULL,
  `date` date NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Detfact_factureId_numLigne_key` (`factureId`,`numLigne`),
  KEY `Detfact_idProduit_date_idx` (`idProduit`,`date`),
  CONSTRAINT `Detfact_factureId_fkey` FOREIGN KEY (`factureId`) REFERENCES `facture` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Detfact_idProduit_fkey` FOREIGN KEY (`idProduit`) REFERENCES `produit` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detinvent`
--

DROP TABLE IF EXISTS `detinvent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detinvent` (
  `id` int NOT NULL AUTO_INCREMENT,
  `inventId` int NOT NULL,
  `produitId` int NOT NULL,
  `date` date NOT NULL,
  `stockTheorique` decimal(15,3) NOT NULL,
  `stockInventaire` decimal(15,3) NOT NULL,
  `valeurTheorique` decimal(15,3) NOT NULL,
  `ecartStock` decimal(15,3) NOT NULL,
  `familleId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `DetInvent_inventId_produitId_key` (`inventId`,`produitId`),
  KEY `DetInvent_produitId_date_idx` (`produitId`,`date`),
  KEY `DetInvent_familleId_fkey` (`familleId`),
  CONSTRAINT `DetInvent_familleId_fkey` FOREIGN KEY (`familleId`) REFERENCES `familleproduit` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `DetInvent_inventId_fkey` FOREIGN KEY (`inventId`) REFERENCES `invent` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `DetInvent_produitId_fkey` FOREIGN KEY (`produitId`) REFERENCES `produit` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detmvtbq`
--

DROP TABLE IF EXISTS `detmvtbq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detmvtbq` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numMvtBq` int DEFAULT NULL,
  `numLigne` int NOT NULL DEFAULT '1',
  `modePaymentId` int NOT NULL,
  `dateEcheance` date DEFAULT NULL,
  `montant` decimal(15,3) NOT NULL,
  `date` date NOT NULL,
  `banqueId` int NOT NULL,
  `rapproche` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `magasinId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `DetMvtBq_banqueId_date_idx` (`banqueId`,`date`),
  KEY `DetMvtBq_modePaymentId_date_idx` (`modePaymentId`,`date`),
  KEY `DetMvtBq_rapproche_date_idx` (`rapproche`,`date`),
  KEY `DetMvtBq_magasinId_idx` (`magasinId`),
  CONSTRAINT `DetMvtBq_banqueId_fkey` FOREIGN KEY (`banqueId`) REFERENCES `banque` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DetMvtBq_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `DetMvtBq_modePaymentId_fkey` FOREIGN KEY (`modePaymentId`) REFERENCES `modepayment` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detras`
--

DROP TABLE IF EXISTS `detras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numRas` int NOT NULL,
  `numLigne` int NOT NULL,
  `codeRet` int NOT NULL,
  `mtBrut` decimal(15,3) NOT NULL,
  `tauxRetenu` decimal(15,3) NOT NULL,
  `mtRetenu` decimal(15,3) NOT NULL,
  `fournisseurId` int NOT NULL,
  `valide` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `DetRas_numRas_numLigne_key` (`numRas`,`numLigne`),
  KEY `DetRas_fournisseurId_idx` (`fournisseurId`),
  KEY `DetRas_codeRet_fkey` (`codeRet`),
  CONSTRAINT `DetRas_codeRet_fkey` FOREIGN KEY (`codeRet`) REFERENCES `libras` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DetRas_fournisseurId_fkey` FOREIGN KEY (`fournisseurId`) REFERENCES `fournisseur` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DetRas_numRas_fkey` FOREIGN KEY (`numRas`) REFERENCES `entras` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dettransetranger`
--

DROP TABLE IF EXISTS `dettransetranger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dettransetranger` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transfertId` int NOT NULL,
  `produitId` int NOT NULL,
  `quantite` decimal(15,3) NOT NULL,
  `prixUnitaire` decimal(15,3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `DetTransEtranger_transfertId_idx` (`transfertId`),
  KEY `DetTransEtranger_produitId_idx` (`produitId`),
  CONSTRAINT `DetTransEtranger_produitId_fkey` FOREIGN KEY (`produitId`) REFERENCES `produit` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `DetTransEtranger_transfertId_fkey` FOREIGN KEY (`transfertId`) REFERENCES `transetranger` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `entavoir`
--

DROP TABLE IF EXISTS `entavoir`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entavoir` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fournisseurId` int NOT NULL,
  `dateAchat` date NOT NULL,
  `numFacture` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `totalTTC` decimal(15,3) NOT NULL,
  `reste` decimal(15,3) NOT NULL DEFAULT '0.000',
  `numRegFour` int DEFAULT NULL,
  `valide` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `magasinId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `EntAvoir_fournisseurId_dateAchat_idx` (`fournisseurId`,`dateAchat`),
  KEY `EntAvoir_numRegFour_fkey` (`numRegFour`),
  KEY `EntAvoir_magasinId_idx` (`magasinId`),
  CONSTRAINT `EntAvoir_fournisseurId_fkey` FOREIGN KEY (`fournisseurId`) REFERENCES `fournisseur` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `EntAvoir_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `EntAvoir_numRegFour_fkey` FOREIGN KEY (`numRegFour`) REFERENCES `regfour` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `entras`
--

DROP TABLE IF EXISTS `entras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dateRas` date NOT NULL,
  `fournisseurId` int NOT NULL,
  `totalBrut` decimal(15,3) NOT NULL DEFAULT '0.000',
  `totalRetenu` decimal(15,3) NOT NULL DEFAULT '0.000',
  `totalNet` decimal(15,3) NOT NULL DEFAULT '0.000',
  `valide` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `magasinId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `EntRas_fournisseurId_dateRas_idx` (`fournisseurId`,`dateRas`),
  KEY `EntRas_magasinId_idx` (`magasinId`),
  CONSTRAINT `EntRas_fournisseurId_fkey` FOREIGN KEY (`fournisseurId`) REFERENCES `fournisseur` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `EntRas_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `entretien`
--

DROP TABLE IF EXISTS `entretien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entretien` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dateEnt` date NOT NULL,
  `matricule` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clientId` int NOT NULL,
  `totEntTTC` decimal(15,3) NOT NULL DEFAULT '0.000',
  `indexKm` decimal(15,3) NOT NULL,
  `prochainIndex` decimal(15,3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `vehiculeId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Entretien_dateEnt_clientId_idx` (`dateEnt`,`clientId`),
  KEY `Entretien_matricule_idx` (`matricule`),
  KEY `Entretien_clientId_fkey` (`clientId`),
  KEY `Entretien_vehiculeId_fkey` (`vehiculeId`),
  CONSTRAINT `Entretien_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Entretien_vehiculeId_fkey` FOREIGN KEY (`vehiculeId`) REFERENCES `vehicule` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `equipe`
--

DROP TABLE IF EXISTS `equipe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipe` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `magasinId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Equipe_code_key` (`code`),
  KEY `Equipe_actif_idx` (`actif`),
  KEY `Equipe_magasinId_idx` (`magasinId`),
  CONSTRAINT `Equipe_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `extractcn`
--

DROP TABLE IF EXISTS `extractcn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `extractcn` (
  `id` int NOT NULL AUTO_INCREMENT,
  `terminal` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shift` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` date DEFAULT NULL,
  `receipt` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `card` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customerName` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transactionType` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` decimal(15,3) DEFAULT NULL,
  `amount` decimal(15,3) DEFAULT NULL,
  `numCN` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dateAvoir` date DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ExtractCN_receipt_key` (`receipt`),
  KEY `ExtractCN_date_numCN_idx` (`date`,`numCN`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `facture`
--

DROP TABLE IF EXISTS `facture`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facture` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `clientId` int NOT NULL,
  `totalHT` decimal(15,3) NOT NULL DEFAULT '0.000',
  `totalTTC` decimal(15,3) NOT NULL DEFAULT '0.000',
  `totTVA` decimal(15,3) NOT NULL DEFAULT '0.000',
  `numBL` int NOT NULL,
  `mtTimbre` decimal(15,3) NOT NULL DEFAULT '0.000',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `magasinId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Facture_numBL_key` (`numBL`),
  KEY `Facture_date_clientId_idx` (`date`,`clientId`),
  KEY `Facture_clientId_fkey` (`clientId`),
  KEY `Facture_magasinId_idx` (`magasinId`),
  CONSTRAINT `Facture_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Facture_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Facture_numBL_fkey` FOREIGN KEY (`numBL`) REFERENCES `bonliv` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `famdepense`
--

DROP TABLE IF EXISTS `famdepense`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `famdepense` (
  `id` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cpt` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `famillepayment`
--

DROP TABLE IF EXISTS `famillepayment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `famillepayment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `libFamille` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `compteCPT` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FamillePayment_libFamille_idx` (`libFamille`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `familleproduit`
--

DROP TABLE IF EXISTS `familleproduit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `familleproduit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cumulOuiNon` tinyint(1) NOT NULL DEFAULT '0',
  `typeProd` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `compteCPT` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `compteACH` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FamilleProduit_libelle_idx` (`libelle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fournisseur`
--

DROP TABLE IF EXISTS `fournisseur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fournisseur` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `raisonSociale` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matriculeFiscal` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Fournisseur_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `impayes`
--

DROP TABLE IF EXISTS `impayes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `impayes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numReg` int NOT NULL,
  `clientId` int NOT NULL,
  `dateReg` date NOT NULL,
  `montantLigne` decimal(15,3) NOT NULL,
  `echeance` date DEFAULT NULL,
  `numCheque` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numRib` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nomBanque` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `impaye` tinyint(1) NOT NULL DEFAULT '1',
  `valide` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Impayes_numReg_key` (`numReg`),
  KEY `Impayes_clientId_impaye_echeance_idx` (`clientId`,`impaye`,`echeance`),
  CONSTRAINT `Impayes_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Impayes_numReg_fkey` FOREIGN KEY (`numReg`) REFERENCES `detailreglements` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invent`
--

DROP TABLE IF EXISTS `invent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invent` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `operateur` int NOT NULL,
  `cloture` tinyint(1) NOT NULL DEFAULT '0',
  `valeurStock` decimal(15,3) NOT NULL DEFAULT '0.000',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Invent_date_operateur_idx` (`date`,`operateur`),
  KEY `Invent_operateur_fkey` (`operateur`),
  CONSTRAINT `Invent_operateur_fkey` FOREIGN KEY (`operateur`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `inventairecarburant`
--

DROP TABLE IF EXISTS `inventairecarburant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventairecarburant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `operateur` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cloture` tinyint(1) NOT NULL DEFAULT '0',
  `valeurStock` decimal(15,3) NOT NULL,
  `magasinId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `InventaireCarburant_date_magasinId_idx` (`date`,`magasinId`),
  KEY `InventaireCarburant_magasinId_fkey` (`magasinId`),
  CONSTRAINT `InventaireCarburant_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `jaugeage`
--

DROP TABLE IF EXISTS `jaugeage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jaugeage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `cuveId` int NOT NULL,
  `equipeId` int NOT NULL,
  `caisseId` int NOT NULL,
  `niveau` decimal(15,3) NOT NULL,
  `temperature` decimal(15,3) DEFAULT NULL,
  `observation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `quantite` decimal(15,3) NOT NULL DEFAULT '0.000',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Jaugeage_date_cuveId_key` (`date`,`cuveId`),
  KEY `Jaugeage_date_equipeId_caisseId_idx` (`date`,`equipeId`,`caisseId`),
  KEY `Jaugeage_cuveId_date_idx` (`cuveId`,`date`),
  KEY `Jaugeage_equipeId_fkey` (`equipeId`),
  KEY `Jaugeage_caisseId_fkey` (`caisseId`),
  CONSTRAINT `Jaugeage_caisseId_fkey` FOREIGN KEY (`caisseId`) REFERENCES `caisse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Jaugeage_cuveId_fkey` FOREIGN KEY (`cuveId`) REFERENCES `cuve` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Jaugeage_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipe` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `joursclotures`
--

DROP TABLE IF EXISTS `joursclotures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `joursclotures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dateJour` date NOT NULL,
  `equipeId` int NOT NULL,
  `fait` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `closedByUserId` int DEFAULT NULL,
  `closedAt` datetime(3) DEFAULT NULL,
  `forced` tinyint(1) NOT NULL DEFAULT '0',
  `closureReason` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `JoursClotures_dateJour_equipeId_key` (`dateJour`,`equipeId`),
  KEY `JoursClotures_dateJour_equipeId_fait_idx` (`dateJour`,`equipeId`,`fait`),
  KEY `JoursClotures_equipeId_fkey` (`equipeId`),
  CONSTRAINT `JoursClotures_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipe` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `libras`
--

DROP TABLE IF EXISTS `libras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `libras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tauxRetenu` decimal(15,3) NOT NULL,
  `compteCPT` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `LibRas_libelle_idx` (`libelle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `magasin`
--

DROP TABLE IF EXISTS `magasin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `magasin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `stationId` int NOT NULL,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Magasin_stationId_key` (`stationId`),
  UNIQUE KEY `Magasin_stationId_code_key` (`stationId`,`code`),
  CONSTRAINT `Magasin_stationId_fkey` FOREIGN KEY (`stationId`) REFERENCES `station` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mobvcarcaisse`
--

DROP TABLE IF EXISTS `mobvcarcaisse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mobvcarcaisse` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `equipeId` int NOT NULL,
  `caisseId` int NOT NULL,
  `pompeId` int NOT NULL,
  `vendeurId` int NOT NULL,
  `indexOuverture` decimal(15,3) NOT NULL,
  `indexFermeture` decimal(15,3) DEFAULT NULL,
  `prixVente` decimal(15,3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `MobVCarCaisse_date_equipeId_caisseId_pompeId_key` (`date`,`equipeId`,`caisseId`,`pompeId`),
  KEY `MobVCarCaisse_date_equipeId_caisseId_idx` (`date`,`equipeId`,`caisseId`),
  KEY `MobVCarCaisse_pompeId_indexFermeture_idx` (`pompeId`,`indexFermeture`),
  KEY `MobVCarCaisse_equipeId_fkey` (`equipeId`),
  KEY `MobVCarCaisse_caisseId_fkey` (`caisseId`),
  KEY `MobVCarCaisse_vendeurId_fkey` (`vendeurId`),
  CONSTRAINT `MobVCarCaisse_caisseId_fkey` FOREIGN KEY (`caisseId`) REFERENCES `caisse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `MobVCarCaisse_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipe` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `MobVCarCaisse_pompeId_fkey` FOREIGN KEY (`pompeId`) REFERENCES `pompe` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `MobVCarCaisse_vendeurId_fkey` FOREIGN KEY (`vendeurId`) REFERENCES `vendeur` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mobvcarcaisseaudit`
--

DROP TABLE IF EXISTS `mobvcarcaisseaudit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mobvcarcaisseaudit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `readingId` int NOT NULL,
  `actorUserId` int DEFAULT NULL,
  `action` enum('initialization','correction','closing_correction') COLLATE utf8mb4_unicode_ci NOT NULL,
  `oldIndex` decimal(15,3) DEFAULT NULL,
  `newIndex` decimal(15,3) NOT NULL,
  `reason` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `MobVCarCaisseAudit_readingId_createdAt_idx` (`readingId`,`createdAt`),
  KEY `MobVCarCaisseAudit_actorUserId_idx` (`actorUserId`),
  CONSTRAINT `MobVCarCaisseAudit_actorUserId_fkey` FOREIGN KEY (`actorUserId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `MobVCarCaisseAudit_readingId_fkey` FOREIGN KEY (`readingId`) REFERENCES `mobvcarcaisse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `modepayment`
--

DROP TABLE IF EXISTS `modepayment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modepayment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `famille` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `compteCPT` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ModePayment_famille_idx` (`famille`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pompe`
--

DROP TABLE IF EXISTS `pompe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pompe` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `prixVente` decimal(15,3) NOT NULL DEFAULT '0.000',
  `cuveId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `caisseId` int DEFAULT NULL,
  `magasinId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Pompe_code_key` (`code`),
  KEY `Pompe_cuveId_active_idx` (`cuveId`,`active`),
  KEY `Pompe_magasinId_idx` (`magasinId`),
  KEY `Pompe_caisseId_fkey` (`caisseId`),
  CONSTRAINT `Pompe_caisseId_fkey` FOREIGN KEY (`caisseId`) REFERENCES `caisse` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Pompe_cuveId_fkey` FOREIGN KEY (`cuveId`) REFERENCES `cuve` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Pompe_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `produit`
--

DROP TABLE IF EXISTS `produit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `libelle` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prixVenteHT` decimal(15,3) NOT NULL DEFAULT '0.000',
  `tva` decimal(15,3) NOT NULL DEFAULT '0.000',
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `codeProduit` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `familleId` int DEFAULT NULL,
  `fournisseurId` int DEFAULT NULL,
  `prixAchatHT` decimal(15,3) NOT NULL DEFAULT '0.000',
  `stock` decimal(15,3) NOT NULL DEFAULT '0.000',
  `tauxTVA` decimal(15,3) NOT NULL DEFAULT '0.000',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Produit_code_key` (`code`),
  UNIQUE KEY `Produit_codeProduit_key` (`codeProduit`),
  KEY `Produit_libelle_actif_idx` (`libelle`,`actif`),
  KEY `Produit_familleId_actif_idx` (`familleId`,`actif`),
  KEY `Produit_fournisseurId_idx` (`fournisseurId`),
  CONSTRAINT `Produit_familleId_fkey` FOREIGN KEY (`familleId`) REFERENCES `familleproduit` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Produit_fournisseurId_fkey` FOREIGN KEY (`fournisseurId`) REFERENCES `fournisseur` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `recettecaisse`
--

DROP TABLE IF EXISTS `recettecaisse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recettecaisse` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `equipeId` int NOT NULL,
  `caisseId` int NOT NULL,
  `vendeurId` int NOT NULL,
  `totalRecettes` decimal(15,3) NOT NULL DEFAULT '0.000',
  `fait` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `magasinId` int DEFAULT NULL,
  `reserveDepart` decimal(15,3) NOT NULL DEFAULT '0.000',
  `recetteTheorique` decimal(15,3) NOT NULL DEFAULT '0.000',
  `ecartRecette` decimal(15,3) NOT NULL DEFAULT '0.000',
  `reserveFinTheorique` decimal(15,3) NOT NULL DEFAULT '0.000',
  `reserveFinAttendue` decimal(15,3) NOT NULL DEFAULT '0.000',
  `ecartCaisse` decimal(15,3) NOT NULL DEFAULT '0.000',
  `seuilTolerance` decimal(15,3) NOT NULL DEFAULT '0.500',
  `commentaireEcart` text COLLATE utf8mb4_unicode_ci,
  `validePar` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `RecetteCaisse_date_equipeId_caisseId_key` (`date`,`equipeId`,`caisseId`),
  KEY `RecetteCaisse_date_equipeId_caisseId_vendeurId_idx` (`date`,`equipeId`,`caisseId`,`vendeurId`),
  KEY `RecetteCaisse_equipeId_fkey` (`equipeId`),
  KEY `RecetteCaisse_caisseId_fkey` (`caisseId`),
  KEY `RecetteCaisse_vendeurId_fkey` (`vendeurId`),
  KEY `RecetteCaisse_magasinId_fkey` (`magasinId`),
  KEY `RecetteCaisse_ecartCaisse_idx` (`ecartCaisse`),
  CONSTRAINT `RecetteCaisse_caisseId_fkey` FOREIGN KEY (`caisseId`) REFERENCES `caisse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `RecetteCaisse_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipe` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `RecetteCaisse_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `RecetteCaisse_vendeurId_fkey` FOREIGN KEY (`vendeurId`) REFERENCES `vendeur` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `regfour`
--

DROP TABLE IF EXISTS `regfour`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regfour` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fournisseurId` int NOT NULL,
  `date` date NOT NULL,
  `montantTotal` decimal(15,3) NOT NULL DEFAULT '0.000',
  `valide` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `magasinId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `RegFour_fournisseurId_date_idx` (`fournisseurId`,`date`),
  KEY `RegFour_magasinId_idx` (`magasinId`),
  CONSTRAINT `RegFour_fournisseurId_fkey` FOREIGN KEY (`fournisseurId`) REFERENCES `fournisseur` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `RegFour_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `retourcuve`
--

DROP TABLE IF EXISTS `retourcuve`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `retourcuve` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `equipeId` int NOT NULL,
  `caisseId` int NOT NULL,
  `vendeurId` int NOT NULL,
  `magasinId` int NOT NULL,
  `totalVolume` decimal(15,3) NOT NULL,
  `totalValeur` decimal(15,3) NOT NULL,
  `valide` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `RetourCuve_date_equipeId_caisseId_key` (`date`,`equipeId`,`caisseId`),
  KEY `RetourCuve_date_equipeId_caisseId_idx` (`date`,`equipeId`,`caisseId`),
  KEY `RetourCuve_equipeId_fkey` (`equipeId`),
  KEY `RetourCuve_caisseId_fkey` (`caisseId`),
  KEY `RetourCuve_vendeurId_fkey` (`vendeurId`),
  KEY `RetourCuve_magasinId_fkey` (`magasinId`),
  CONSTRAINT `RetourCuve_caisseId_fkey` FOREIGN KEY (`caisseId`) REFERENCES `caisse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `RetourCuve_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipe` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `RetourCuve_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `RetourCuve_vendeurId_fkey` FOREIGN KEY (`vendeurId`) REFERENCES `vendeur` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `service`
--

DROP TABLE IF EXISTS `service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service` (
  `id` int NOT NULL AUTO_INCREMENT,
  `libelle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prixHT` decimal(15,3) NOT NULL,
  `tauxTVA` decimal(5,2) NOT NULL,
  `prixTTC` decimal(15,3) NOT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `setparam`
--

DROP TABLE IF EXISTS `setparam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `setparam` (
  `id` int NOT NULL DEFAULT '1',
  `nomStation` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adresse` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tel` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mf` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rc` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logoUrl` text COLLATE utf8mb4_unicode_ci,
  `timbre` decimal(15,3) NOT NULL DEFAULT '0.000',
  `tauxTVADefaut` decimal(15,3) NOT NULL DEFAULT '19.000',
  `devise` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TND',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `stationId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `SetParam_stationId_key` (`stationId`),
  CONSTRAINT `SetParam_stationId_fkey` FOREIGN KEY (`stationId`) REFERENCES `station` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `station`
--

DROP TABLE IF EXISTS `station`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `station` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Station_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tauxtva`
--

DROP TABLE IF EXISTS `tauxtva`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tauxtva` (
  `id` int NOT NULL AUTO_INCREMENT,
  `taux` decimal(5,2) NOT NULL,
  `libelle` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transetranger`
--

DROP TABLE IF EXISTS `transetranger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transetranger` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fournisseurId` int NOT NULL,
  `dateTransfert` date NOT NULL,
  `op` int NOT NULL,
  `valide` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `TransEtranger_fournisseurId_dateTransfert_idx` (`fournisseurId`,`dateTransfert`),
  KEY `TransEtranger_op_fkey` (`op`),
  CONSTRAINT `TransEtranger_fournisseurId_fkey` FOREIGN KEY (`fournisseurId`) REFERENCES `fournisseur` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `TransEtranger_op_fkey` FOREIGN KEY (`op`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('gerant','caissier','vendeur') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'vendeur',
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `prenom` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `magasinId` int DEFAULT NULL,
  `passwordHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `nom` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `telephone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_username_key` (`username`),
  KEY `User_role_actif_idx` (`role`,`actif`),
  KEY `User_magasinId_idx` (`magasinId`),
  CONSTRAINT `User_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vehicule`
--

DROP TABLE IF EXISTS `vehicule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clientId` int NOT NULL,
  `matricule` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `marque` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modele` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `annee` int DEFAULT NULL,
  `carburantType` tinyint DEFAULT NULL,
  `indexKmActuel` bigint DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Vehicule_clientId_matricule_key` (`clientId`,`matricule`),
  KEY `Vehicule_clientId_matricule_idx` (`clientId`,`matricule`),
  CONSTRAINT `Vehicule_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `client` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vendeur`
--

DROP TABLE IF EXISTS `vendeur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendeur` (
  `id` int NOT NULL AUTO_INCREMENT,
  `matricule` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nom` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT '1',
  `userId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `equipeId` int DEFAULT NULL,
  `magasinId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Vendeur_matricule_key` (`matricule`),
  UNIQUE KEY `Vendeur_userId_key` (`userId`),
  KEY `Vendeur_actif_idx` (`actif`),
  KEY `Vendeur_magasinId_idx` (`magasinId`),
  KEY `Vendeur_equipeId_fkey` (`equipeId`),
  CONSTRAINT `Vendeur_equipeId_fkey` FOREIGN KEY (`equipeId`) REFERENCES `equipe` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Vendeur_magasinId_fkey` FOREIGN KEY (`magasinId`) REFERENCES `magasin` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Vendeur_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-30 11:46:11
