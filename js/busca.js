/*
 * Busca do Sabor SL
 * Este arquivo cuida da pesquisa e dos filtros da página Buscar.
 * A ideia é ajudar a pessoa a encontrar uma opção sem precisar olhar todos os cartões.
 */
(function () {
    "use strict"; // Ajuda a detectar alguns erros de escrita no código.

    // Localiza os elementos da página que serão usados pela busca e pelos filtros.
    const formularioBusca = document.querySelector("#form-busca");
    const campoBusca = document.querySelector("#campo-busca");
    const botoesFiltro = document.querySelectorAll(".filtro[data-categoria]");
    const cartoes = document.querySelectorAll("#lista-estabelecimentos .cartao");
    const mensagemSemResultados = document.querySelector("#mensagem-sem-resultados");
    const contadorResultados = document.querySelector("#contador-resultados");

    // A categoria inicial é para mostrar todos os estabelecimentos.
    let categoriaSelecionada = "todos";

    // Coloca o texto em minúsculas e remove os acentos para facilitar a comparação.
    function normalizarTexto(texto) {
        return texto.toLocaleLowerCase("pt-BR")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    // Exibe apenas os cartões que correspondem à busca e à categoria selecionada.
    function filtrarEstabelecimentos() {
        // Lê o que foi digitado, remove espaços extras e normaliza o texto.
        const pesquisa = normalizarTexto(campoBusca.value.trim());
        let quantidadeVisivel = 0;

        // Verifica cada estabelecimento da lista.
        cartoes.forEach(function (cartao) {
            // Confere se a categoria do cartão corresponde ao filtro ativo.
            const correspondeCategoria = categoriaSelecionada === "todos" ||
                cartao.dataset.categoria === categoriaSelecionada;

            // Confere se o texto do cartão contém o que foi digitado.
            const correspondeBusca = normalizarTexto(cartao.textContent).includes(pesquisa);

            // O cartão aparece somente se corresponder à categoria e à busca escolhida.
            const mostrar = correspondeCategoria && correspondeBusca;
            cartao.hidden = !mostrar;

            // Conta quantos cartões estão sendo exibidos.
            if (mostrar) quantidadeVisivel++;
        });

        // Mostra a mensagem quando nenhum estabelecimento corresponde aos filtros.
        mensagemSemResultados.hidden = quantidadeVisivel !== 0;

        // Atualiza o contador e ajusta a palavra entre singular e plural.
        contadorResultados.textContent = quantidadeVisivel +
            (quantidadeVisivel === 1
                ? " estabelecimento encontrado"
                : " estabelecimentos encontrados");
    }

    // Permite que o script interno de buscar.html chame esta função.
    window.filtrarEstabelecimentos = filtrarEstabelecimentos;

    // Impede que o formulário recarregue a página e aplica a busca ao enviá-lo.
    formularioBusca.addEventListener("submit", function (evento) {
        evento.preventDefault();
        filtrarEstabelecimentos();
    });

    // Atualiza os resultados enquanto a pessoa digita.
    campoBusca.addEventListener("input", filtrarEstabelecimentos);

    // Configura os botões para trocar a categoria selecionada.
    botoesFiltro.forEach(function (botao) {
        botao.addEventListener("click", function () {
            // Salva a categoria indicada pelo botão clicado.
            categoriaSelecionada = botao.dataset.categoria;

            // Marca o botão escolhido e desmarca os demais.
            botoesFiltro.forEach(function (outroBotao) {
                const selecionado = outroBotao === botao;
                outroBotao.classList.toggle("ativo", selecionado);

                // Informa aos leitores de tela se o filtro está selecionado.
                outroBotao.setAttribute("aria-pressed", String(selecionado));
            });

            // Atualiza os cartões conforme a nova categoria.
            filtrarEstabelecimentos();
        });
    });

    // Aplica os filtros assim que a página é carregada.
    filtrarEstabelecimentos();
})();
