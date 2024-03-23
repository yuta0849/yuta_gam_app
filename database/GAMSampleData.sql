-- /docker-entrypoint-initdb.d/はDockerコンテナ内部のパス
-- dockerfileにてcsvファイルは上記パスへCOPYされている

CREATE DATABASE IF NOT EXISTS AdManager;

USE AdManager;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  google_user_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255)
);

-- CREATE TABLE IF NOT EXISTS user_uploaded_data (
--   id INT PRIMARY KEY AUTO_INCREMENT,
--   upload_timestamp TIMESTAMP,
--   user_id VARCHAR(255) NOT NULL,
--   save_data_name VARCHAR(255) NOT NULL,
--   date DATE,
--   ad_unit VARCHAR(255) NOT NULL,
--   avg_adx_cpm DECIMAL(10, 2) NOT NULL,
--   UNIQUE KEY uix_1 (user_id, save_data_name)
-- );

CREATE TABLE IF NOT EXISTS uploaded_datasets (
  dataset_id INT PRIMARY KEY AUTO_INCREMENT,
  upload_timestamp TIMESTAMP,
  user_id VARCHAR(255) NOT NULL,
  save_data_name VARCHAR(255) NOT NULL,
  UNIQUE KEY uix_1 (user_id, save_data_name)
);

CREATE TABLE IF NOT EXISTS uploaded_data (
  data_id INT PRIMARY KEY AUTO_INCREMENT,
  dataset_id INT,
  date DATE NOT NULL,
  ad_unit VARCHAR(255) NOT NULL,
  avg_adx_cpm DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (dataset_id) REFERENCES uploaded_datasets(dataset_id)
);

CREATE TABLE IF NOT EXISTS Adx_Data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE,
  ad_unit VARCHAR(255),
  adx_impressions INT,
  adx_revenue DECIMAL(10, 2),
  avg_adx_cpm DECIMAL(10, 2)
);
  
LOAD DATA INFILE '/docker-entrypoint-initdb.d/GAMSampleData_2_masked.csv'
INTO TABLE Adx_Data
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(@var1, ad_unit, adx_impressions, adx_revenue, avg_adx_cpm)
SET date = STR_TO_DATE(@var1, '%Y/%m/%d');