-- /docker-entrypoint-initdb.d/はDockerコンテナ内部のパス
-- dockerfileにてcsvファイルは上記パスへCOPYされている

CREATE DATABASE IF NOT EXISTS AdManager;

USE AdManager;

CREATE TABLE IF NOT EXISTS Adx_Last_7days_Data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE,
  ad_unit VARCHAR(255),
  adx_impressions INT,
  adx_revenue DECIMAL(10, 2),
  avg_adx_cpm DECIMAL(10, 2)
);
  
LOAD DATA INFILE '/docker-entrypoint-initdb.d/GAMSampleData_1.csv'
INTO TABLE Adx_Last_7days_Data
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(@var1, ad_unit, adx_impressions, adx_revenue, avg_adx_cpm)
SET date = STR_TO_DATE(@var1, '%Y/%m/%d');