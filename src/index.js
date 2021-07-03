/* eslint-disable no-await-in-loop */
/* eslint-disable array-callback-return */
/* eslint-disable no-plusplus */
import webdriver from 'selenium-webdriver';
import fs from 'fs';

const {
  Builder, By, Key,
} = webdriver;

const novaData = Date.now();

const captura = async (driver, url) => {
  try {
    await driver.get(url);
    const pagina = await driver.takeScreenshot();
    fs.writeFile(`./src/images/captura${novaData}.png`, pagina, 'base64', (err) => console.log('Erro ao salvar o arquivo', err));
  } catch (err) {
    console.log('Ocorreu ao executar o screenshot.', err);
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

const pesquisa = async () => {
  const driver = await new Builder()
    .forBrowser('chrome')
    .build();
  try {
    await driver.get('https://www.google.com.br');
    await driver.findElement(By.xpath('/html/body/div[1]/div[3]/form/div[1]/div[1]/div[1]/div/div[2]/input')).sendKeys('empresas informatica centro historico SP', Key.RETURN);
    const listaEmpresas = await driver.findElements(By.className('g'));
    let empresas = [];
    for (let i = 0; i < listaEmpresas.length; i++) {
      empresas.push(await listaEmpresas[i].getText());
    }
    empresas = await padronizaInfo(empresas);
    for (let i = 0; i < empresas.length; i++) {
      await captura(driver, empresas[i].site);
    }
  } catch (err) {
    throw new Error(err);
  }
};

pesquisa();
