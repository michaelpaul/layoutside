SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

CREATE SCHEMA IF NOT EXISTS `layoutside` DEFAULT CHARACTER SET utf8 ;
USE `layoutside` ;

-- -----------------------------------------------------
-- Table `layoutside`.`layout`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `layoutside`.`layout` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `fluid` VARCHAR(45) NULL ,
  `column_count` VARCHAR(45) NULL DEFAULT '24' ,
  `column_width` VARCHAR(45) NULL DEFAULT '30' ,
  `gutter_width` VARCHAR(45) NULL DEFAULT '10' ,
  `output_filename` VARCHAR(45) NULL DEFAULT 'index.html' ,
  `create_date` DATE NULL ,
  `update_date` TIMESTAMP NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `layoutside`.`box`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `layoutside`.`box` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `title` VARCHAR(45) NULL ,
  `tagname` VARCHAR(45) NULL ,
  `body` TEXT NULL ,
  `html_id` VARCHAR(45) NULL ,
  `css_class` VARCHAR(45) NULL ,
  `width` VARCHAR(45) NULL ,
  `height` INT NULL ,
  `order` VARCHAR(45) NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `layoutside`.`post`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `layoutside`.`post` (
  `idpost` INT NOT NULL AUTO_INCREMENT ,
  `title` VARCHAR(45) NULL ,
  `content` VARCHAR(45) NULL ,
  PRIMARY KEY (`idpost`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `layoutside`.`author`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `layoutside`.`author` (
  `idauthor` INT NOT NULL ,
  `first_name` VARCHAR(45) NULL ,
  `last_name` VARCHAR(45) NULL ,
  PRIMARY KEY (`idauthor`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `layoutside`.`post_has_author`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `layoutside`.`post_has_author` (
  `post_idpost` INT NOT NULL ,
  `author_idauthor` INT NOT NULL ,
  PRIMARY KEY (`post_idpost`, `author_idauthor`) ,
  CONSTRAINT `fk_post_has_author_post`
    FOREIGN KEY (`post_idpost` )
    REFERENCES `layoutside`.`post` (`idpost` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_post_has_author_author1`
    FOREIGN KEY (`author_idauthor` )
    REFERENCES `layoutside`.`author` (`idauthor` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_post_has_author_author1` ON `layoutside`.`post_has_author` (`author_idauthor` ASC) ;


-- -----------------------------------------------------
-- Table `layoutside`.`tag`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `layoutside`.`tag` (
  `idtag` INT NOT NULL ,
  `name` VARCHAR(45) NULL ,
  PRIMARY KEY (`idtag`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `layoutside`.`category`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `layoutside`.`category` (
  `idcategory` INT NOT NULL ,
  `name` VARCHAR(45) NULL ,
  PRIMARY KEY (`idcategory`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `layoutside`.`user`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `layoutside`.`user` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(45) NULL ,
  `email` VARCHAR(45) NULL ,
  `login` VARCHAR(45) NULL ,
  `pass` VARCHAR(45) NULL ,
  `plan` VARCHAR(45) NULL ,
  `create_date` DATE NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;



SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
