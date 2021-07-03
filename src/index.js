/* eslint-disable import/extensions */
/* eslint-disable no-await-in-loop */
/* eslint-disable array-callback-return */
/* eslint-disable no-plusplus */
import webdriver from 'selenium-webdriver';
import fs from 'fs';
import dotenv from 'dotenv';
import readlinesync from 'readline-sync';
import mongoose from 'mongoose';
import { MONGO_URL } from './config.js';
import logger from './logger.js';
import Empresa from './model.js';

const input = readlinesync;

dotenv.config();

const {
  Builder, By, Key,
} = webdriver;

const connect = async () => {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('Conectado ao MongoDB!');
  } catch (err) {
    throw new Error(err);
  }
};

const disconnect = async () => {
  await mongoose.disconnect();
  logger.info('Desconectado do MongoDB');
};

const novaData = Date.now();

const captura = async (driver, url) => {
  try {
    await driver.get(url);
    const pagina = await driver.takeScreenshot();
    fs.writeFile(`./src/images/captura${novaData}.png`, pagina, 'base64', (err) => logger.error('Erro ao salvar o arquivo', err));
  } catch (err) {
    logger.error('Ocorreu ao executar o screenshot.', err);
  }
};

const padronizaInfo = async (array) => {
  const arrayLimpo = [];
  array.map((empresa) => {
    arrayLimpo.push({
      nome: empresa.split('\n')[0],
      site: empresa.split('\n')[1].split(' ')[0],
    });
  });
  return arrayLimpo;
};

const registraBanco = async (array) => {
  try {
    const insereBanco = new Empresa(
      {
        empresa: array.nome,
        site: array.site,
      },
    );
    await insereBanco.save();
  } catch (err) {
    logger.error(err);
  }
};

const pesquisa = async (cidadeInformada) => {
  const driver = await new Builder()
    .forBrowser('chrome')
    .build();
  try {
    await driver.get(process.env.BUSCADOR);
    await driver.findElement(By.xpath('/html/body/div[1]/div[3]/form/div[1]/div[1]/div[1]/div/div[2]/input')).sendKeys(`empresas TI ${cidadeInformada} `, Key.RETURN);
    const listaEmpresas = await driver.findElements(By.className('g'));
    let empresas = [];
    for (let i = 0; i < listaEmpresas.length; i++) {
      empresas.push(await listaEmpresas[i].getText());
    }
    empresas = await padronizaInfo(empresas);
    for (let i = 0; i < empresas.length; i++) {
      await registraBanco(empresas[i]);
    }

    for (let i = 0; i < empresas.length; i++) {
      await captura(driver, empresas[i].site);
    }
  } catch (err) {
    throw new Error(err);
  }
};

const main = async () => {
  await connect();
  const cidadeParaPesquisa = input.question('Digite uma cidade ou localidade para pesquisa: ');
  await pesquisa(cidadeParaPesquisa);
  await disconnect();
};

main();
