/*
 * Favoritos do Sabor SL
 * Aqui guardamos os estabelecimentos que a pessoa marcou para consultar depois.
 * Os dados ficam apenas neste navegador, usando o armazenamento local.
 */
(function () {
  "use strict"; // Mantém o código mais previsível e ajuda a evitar alguns erros.

  // Nome usado para salvar e encontrar os favoritos no armazenamento do navegador.
  const CHAVE = "saborSL_favoritos";

  // Lê os favoritos salvos. Se não houver dados ou ocorrer um erro, retorna uma lista vazia.
  function lerFavoritos() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE) || "[]");
    } catch (_) {
      return [];
    }
  }

  // Converte a lista de favoritos em texto e salva no navegador.
  function salvarFavoritos(lista) {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  }

  // Reúne as informações de um cartão para salvar nos favoritos.
  function dadosDoCartao(cartao) {
    const link = cartao.getAttribute("href") || "#";
    const titulo =
      cartao.querySelector("h3, strong")?.textContent.trim() ||
      cartao.textContent.trim();
    const imagem = cartao.querySelector("img")?.getAttribute("src") || "";
    const descricao =
      cartao.querySelector("p")?.textContent.trim() || "Estabelecimento";
    const categoria = cartao.dataset.categoria || "todos";

    // O link também funciona como identificador único do estabelecimento.
    return { id: link, link, titulo, imagem, descricao, categoria };
  }

  // Adiciona ou atualiza os botões de favorito nos cartões da página.
  function atualizarBotoes() {
    const favoritos = lerFavoritos();

    // Seleciona cartões com link, exceto os que já estão na lista de favoritos.
    document.querySelectorAll(".cartoes .cartao[href]").forEach(cartao => {
      if (cartao.closest("#lista-favoritos")) return;

      cartao.classList.add("cartao-favoritavel");

      // Procura um botão existente para evitar criar botões duplicados.
      let botao = cartao.querySelector(":scope > .botao-favorito");

      // Cria o botão de favorito se o cartão ainda não tiver um.
      if (!botao) {
        botao = document.createElement("button");
        botao.type = "button";
        botao.className = "botao-favorito";
        botao.setAttribute("aria-label", "Adicionar aos favoritos");
        botao.title = "Adicionar aos favoritos";
        botao.innerHTML = "♡";
        cartao.appendChild(botao);

        // Alterna o estado do favorito ao clicar no botão.
        botao.addEventListener("click", evento => {
          evento.preventDefault(); // Evita abrir o link do cartão.
          evento.stopPropagation(); // Evita que o clique se propague para outros elementos.

          const dados = dadosDoCartao(cartao);
          const lista = lerFavoritos();
          const existe = lista.some(item => item.id === dados.id);

          // Se já estiver salvo:remove; caso contrário:adiciona à lista.
          salvarFavoritos(
            existe
              ? lista.filter(item => item.id !== dados.id)
              : [...lista, dados]
          );

          atualizarBotoes();

          // Atualiza a página de favoritos, se ela estiver aberta.
          if (document.querySelector("#lista-favoritos")) {
            renderizarFavoritos();
          }
        });
      }

      // Verifica se este cartão está entre os favoritos salvos.
      const ativo = favoritos.some(
        item => item.id === dadosDoCartao(cartao).id
      );

      // Atualiza o coração e os textos acessíveis conforme o estado do botão.
      botao.classList.toggle("esta-favorito", ativo);
      botao.innerHTML = ativo ? "♥" : "♡";
      botao.title = ativo
        ? "Remover dos favoritos"
        : "Adicionar aos favoritos";
      botao.setAttribute("aria-label", botao.title);
    });
  }

  // Monta na página os cartões dos estabelecimentos salvos como favoritos.
  function renderizarFavoritos() {
    const lista = document.querySelector("#lista-favoritos");

    // Encerra a função se a página atual não tiver a lista de favoritos.
    if (!lista) return;

    const favoritos = lerFavoritos();
    lista.innerHTML = "";

    // Mostra a mensagem de lista vazia somente quando não tem favoritos.
    const vazio = document.querySelector("#favoritos-vazio");
    if (vazio) vazio.hidden = favoritos.length > 0;

    // Cria um cartão para cada item salvo.
    favoritos.forEach(item => {
      const cartao = document.createElement("a");
      cartao.className = "cartao cartao-favoritavel";
      cartao.href = item.link;

      // Adiciona a imagem se o estabelecimento tiver uma salva.
      if (item.imagem) {
        const img = document.createElement("img");
        img.src = item.imagem;
        img.alt = item.titulo;
        img.loading = "lazy"; // Carrega a imagem quando ela estiver próxima de aparecer.
        cartao.appendChild(img);
      }

      // Cria a área de texto do cartão.
      const corpo = document.createElement("div");
      corpo.className = "corpo-cartao";

      const h3 = document.createElement("h3");
      h3.textContent = item.titulo;

      const p = document.createElement("p");
      p.textContent = item.descricao;

      corpo.append(h3, p);
      cartao.appendChild(corpo);
      lista.appendChild(cartao);
    });

    // Atualiza os botões depois de montar os cartões.
    atualizarBotoes();
  }

  // Deixa a função disponível para os outros scripts da página.
  window.renderizarFavoritos = renderizarFavoritos;

  // Executa as atualizações depois que o HTML da página foi carregado.
  document.addEventListener("DOMContentLoaded", () => {
    atualizarBotoes();
    renderizarFavoritos();
  });
})();