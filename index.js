"use strict";

function verificarClasse(ip) {
  ip = validarEntrada(ip);
  return tipoClasse(primeiroOcteto(ip));
}

function validarEntrada(value) {
  if (ehVazio(value)) {
    throw new Error("Passe algum valor por parâmetro");
  }

  if (!ehString(value)) {
    throw new Error("O parâmetro deve ser do tipo String");
  }

  value = value.trim();

  if (!ehValidoMascaraOrIP(value)) {
    throw new Error("Utilize pontos para separar os valores e não deixe espaços");
  }

  return value;
}

function ehVazio(value) {
  return !!!value;
}

function ehString(value) {
  return typeof value === "string";
}

function ehValidoMascaraOrIP(value) {
  const regExp = /^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|2[0-5][0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|2[0-5][0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
  return regExp.test(value);
}

function converterDecimalParaBinario(decimal) {
  return (decimal >>> 0).toString(2);
}

function primeiroOcteto(value) {
  value = value.split(".")[0];
  value = converterDecimalParaBinario(value);
  return preencherOcteto(value);
}

function preencherOcteto(value) {
  return "00000000".slice(value.length) + value;
}

function tipoClasse(octeto) {
  if (octeto.slice(0, 1) === "0") {
    return "A";
  } else if (octeto.slice(0, 2) === "10") {
    return "B";
  } else if (octeto.slice(0, 3) === "110") {
    return "C";
  } else if (octeto.slice(0, 4) === "1110") {
    return "D";
  } else if (octeto.slice(0, 4) === "1111") {
    return "E";
  }
}

function verificarRede(ip, mascara) {
  ip = converterDecimalParaBinarioQuatroOctetos(ip);
  mascara = converterDecimalParaBinarioQuatroOctetos(mascara);

  let rede = "";

  for (let i = 0; i < ip.length; i++) {
    let ipBin = ip.charAt(i);
    let mascaraBin = mascara.charAt(i);

    if (ipBin === "." || mascaraBin === ".") {
      rede += ipBin || mascaraBin;
    } else {
      rede += ipBin & mascaraBin;
    }
  }

  return converteBinarioParaDecimalQuatroNumeros(rede);
}

function verificarBroadcast(ip, mascara) {
  ip = converterDecimalParaBinarioQuatroOctetos(ip);
  mascara = converterDecimalParaBinarioQuatroOctetos(mascara);

  let broadcast = "";

  for (let i = 0; i < ip.length; i++) {
    let ipBin = ip.charAt(i);
    let mascaraBin = mascara.charAt(i);

    if (ipBin === "." || mascaraBin === ".") {
      broadcast += ".";
    } else {
      broadcast += ipBin | (negacaoBinaria(mascaraBin));
    }
  }

  return converteBinarioParaDecimalQuatroNumeros(broadcast);
}



function converterDecimalParaBinarioQuatroOctetos(value) {
  // Converte para string para garantir que podemos usar split
  value = value.toString();
  value = value.split(".");
  let octetos = preencherOcteto(converterDecimalParaBinario(value[0]));
  octetos += "." + preencherOcteto(converterDecimalParaBinario(value[1]));
  octetos += "." + preencherOcteto(converterDecimalParaBinario(value[2]));
  octetos += "." + preencherOcteto(converterDecimalParaBinario(value[3]));
  return octetos;
}

function converterBinarioParaDecimal(value) {
  return parseInt(value, 2);
}

function converteBinarioParaDecimalQuatroNumeros(value) {
  value = value.split(".");
  let numeros = converterBinarioParaDecimal(value[0]);
  numeros += "." + converterBinarioParaDecimal(value[1]);
  numeros += "." + converterBinarioParaDecimal(value[2]);
  numeros += "." + converterBinarioParaDecimal(value[3]);
  return numeros;
}

function negacaoBinaria(value) {
  return value === "1" ? "0" : "1";
}

function negacaoBinariaQuatroOctetos(value) {
  let valueNegado = "";
  for (let i = 0; i < value.length; i++) {
    let valueBin = value.charAt(i);
    if (valueBin === ".") {
      valueNegado += valueBin;
    } else {
      valueNegado += negacaoBinaria(valueBin);
    }
  }
  return valueNegado;
}

function notacaoCIDR(value) {
  let mascaraCIDR = "";

  for (let i = 0; i < 32; i++) {
    if (i < value) {
      mascaraCIDR += "1";
    } else {
      mascaraCIDR += "0";
    }
  }

  mascaraCIDR = converteBinarioParaDecimalQuatroNumeros(formatarBinarioQuatroOctetos(mascaraCIDR));
  return mascaraCIDR;
}

function formatarBinarioQuatroOctetos(value) {
  let octeto = value.slice(0, 8);
  octeto += "." + value.slice(8, 16);
  octeto += "." + value.slice(16, 24);
  octeto += "." + value.slice(24, 32);
  return octeto;
}

function verificarSubrede(classeIp, mascara) {
  mascara = converterDecimalParaBinarioQuatroOctetos(mascara);
  switch (classeIp) {
    case "A":
      return Math.pow(2, Math.abs(8 - qtdBitsLigado(mascara)));
    case "B":
      return Math.pow(2, Math.abs(16 - qtdBitsLigado(mascara)));
    case "C":
      return Math.pow(2, Math.abs(24 - qtdBitsLigado(mascara)));
    default:
      return "N/A"; // Sub-redes não se aplicam a Classe D e E
  }
}

function verificarHost(mascara) {
  mascara = converterDecimalParaBinarioQuatroOctetos(mascara);
  return new Number(Math.pow(2, qtdBitsDesligado(mascara)) - 2);
}

function qtdBitsLigado(mascara) {
  return mascara.match(/1/g).length;
}

function qtdBitsDesligado(mascara) {
  return mascara.match(/0/g).length;
}

function aumentarIp(ip, incremento) {
  const ipBinario = converterDecimalParaBinarioQuatroOctetos(ip).replace(/\./g, '');
  const ipNovoBinario = (parseInt(ipBinario, 2) + incremento).toString(2).padStart(32, '0');
  return converteBinarioParaDecimalQuatroNumeros(formatarBinarioQuatroOctetos(ipNovoBinario));
}

const $form = document.querySelector("form");
const $ip = document.getElementById("ip");

$form.addEventListener("submit", function(e) {
  e.preventDefault();
  limparCampos();

  try {
    let ip = $ip.value;
    let cidr;
    let mascara;
    let classe;

    if (ip.includes("/")) {
      [ip, cidr] = ip.split("/");
      cidr = parseInt(cidr, 10);
      mascara = notacaoCIDR(cidr);
    } else {
      classe = verificarClasse(ip);
      switch (classe) {
        case "A":
          mascara = "255.0.0.0";
          break;
        case "B":
          mascara = "255.255.0.0";
          break;
        case "C":
          mascara = "255.255.255.0";
          break;
        default:
          throw new Error("Classe IP inválida ou não suportada");
      }
    }

    const rede = verificarRede(ip, mascara);
    const broadcast = verificarBroadcast(ip, mascara);
    const host = classe === "D" || classe === "E" ? "N/A" : verificarHost(mascara);
    const subrede = cidr ? verificarSubrede(classe || verificarClasse(ip), mascara) : "N/A";

    const $secaoResultado = document.querySelector('.result');
    $secaoResultado.insertAdjacentHTML('beforeend', criarCard('Classe', classe || verificarClasse(ip)));
    $secaoResultado.insertAdjacentHTML('beforeend', criarCard('IP', ip, converterDecimalParaBinarioQuatroOctetos(ip)));
    $secaoResultado.insertAdjacentHTML('beforeend', criarCard('CIDR', cidr !== undefined ? '/' + cidr : 'N/A'));
    $secaoResultado.insertAdjacentHTML('beforeend', criarCard('Máscara', mascara, converterDecimalParaBinarioQuatroOctetos(mascara)));
    $secaoResultado.insertAdjacentHTML('beforeend', criarCard('Endereço de Rede', rede, converterDecimalParaBinarioQuatroOctetos(rede)));
    $secaoResultado.insertAdjacentHTML('beforeend', criarCard('Endereço de Broadcast', broadcast, converterDecimalParaBinarioQuatroOctetos(broadcast)));
    $secaoResultado.insertAdjacentHTML('beforeend', criarCard('Quantidade de host', host));
    $secaoResultado.insertAdjacentHTML('beforeend', criarCard('Quantidade de sub-redes', subrede));

    if (cidr && classe !== "D" && classe !== "E") {
      const $btnSubredes = document.createElement('button');
      $btnSubredes.textContent = "Mostrar Subredes";
      $btnSubredes.classList.add('button');
      $btnSubredes.addEventListener('click', function() {
        const subredes = calcularSubredes(rede, cidr, subrede); // Passando a quantidade de sub-redes dinâmica
        mostrarTabelaSubredes(subredes);
        $btnSubredes.disabled = true;
      });
      $secaoResultado.appendChild($btnSubredes);
    }
  } catch (error) {
    document.querySelector('body').insertAdjacentHTML('beforeend', 
                             `<div class="result alert warning">
                                <p>Verifique os valores inseridos</p>
                              </div>`
   )}
});

function limparCampos() {
  document.querySelector('.result') ? document.querySelector('.result').innerHTML = "" : "";
}





//MOSTRAR A TEBELA DE SUBREDES AO CLICAR NO BOTÃO DE MOSTRAR SUB REDES


function calcularSubredes(ip, cidr, qtdSubredes) {
  const blocos = Math.pow(2, 32 - cidr);
  const ipBinario = converterDecimalParaBinarioQuatroOctetos(ip).replace(/\./g, '');

  let subredes = [];

  // Calculando as sub-redes dinâmicas com base na quantidade especificada
  for (let i = 0; i < qtdSubredes; i++) {
    const subredeBinario = (parseInt(ipBinario, 2) + i * blocos).toString(2).padStart(32, '0');
    const subredeBinarioFormatado = formatarBinarioQuatroOctetos(subredeBinario);
    const redeDecimal = converteBinarioParaDecimalQuatroNumeros(subredeBinarioFormatado);
    
    // Calculando o endereço de broadcast corretamente
    const broadcastDecimal = aumentarIp(redeDecimal, blocos - 1);
    
    const primeiroIpValido = aumentarIp(redeDecimal, 1);
    const ultimoIpValido = aumentarIp(broadcastDecimal, -1);

    subredes.push({
      rede: redeDecimal,
      broadcast: broadcastDecimal,
      primeiroIpValido,
      ultimoIpValido,
      mascara: notacaoCIDR(cidr),
      cidr: cidr // Adicionando o CIDR como parte do objeto subrede
    });
  }

  return subredes;
}


function aumentarIp(ip, incremento) {
  const ipBinario = converterDecimalParaBinarioQuatroOctetos(ip).replace(/\./g, '');
  const ipNovoBinario = (parseInt(ipBinario, 2) + incremento).toString(2).padStart(32, '0');
  return converteBinarioParaDecimalQuatroNumeros(formatarBinarioQuatroOctetos(ipNovoBinario));
}



function formatarBinarioQuatroOctetos(binario) {
  return binario.match(/.{1,8}/g).join('.');
}

function converteBinarioParaDecimalQuatroNumeros(value) {
  return value.split('.').map(octeto => parseInt(octeto, 2)).join('.');
}


function criarCard(texto, valor1, valor2) {
  if (!!valor2) {
    return `<div class="card">
              <p>${texto}</p>
              <p>${valor1}</p>
              <p>${valor2}</p>
            </div>`
  } else {
    return `<div class="card">
              <p>${texto}</p>
              <p>${valor1}</p>
            </div>`
  }
}

function mostrarTabelaSubredes(subredes) {
  let tabelaHTML = `
    <table>
      <thead>
        <tr>
          <th>Sub-rede</th>
          <th>Endereço de Rede</th>
          <th>Endereço de Broadcast</th>
          <th>Primeiro IP Válido</th>
          <th>Último IP Válido</th>
          <th>Máscara de Sub-rede</th>
          
        </tr>
      </thead>
      <tbody>
  `;

  subredes.forEach((subrede, index) => {
    tabelaHTML += `
      <tr>
        <td>${index + 1}°</td>
        <td>${subrede.rede}/${subrede.cidr}</td>
        <td>${subrede.broadcast}</td>
        <td>${subrede.primeiroIpValido}</td>
        <td>${subrede.ultimoIpValido}</td>
        <td>${subrede.mascara}</td>
        
      </tr>
    `;
  });

  tabelaHTML += `
      </tbody>
    </table>
  `;

  // Utilize querySelectorAll para obter todos os elementos '.result' e adicionar a tabela
  const $secoesResultado = document.querySelectorAll('.result');
  $secoesResultado.forEach($secaoResultado => {
    $secaoResultado.insertAdjacentHTML('beforeend', tabelaHTML);
  });
}
