/*
 * Entrada e cadastro demonstrativos do Sabor SL.
 * Este formulário verifica os campos e guarda os dados neste navegador.
 * Como o projeto não usa um servidor, isso serve apenas para demonstração escolar.
 */

document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.querySelector("#form-login");
    const mensagem = document.querySelector("#mensagem-login");
    const campoNome = document.querySelector("#nome-conta");
    const campoEmail = document.querySelector("#email-conta");
    const campoSenha = document.querySelector("#senha-conta");
    const botaoEnviar = document.querySelector("#enviar-conta");
    const modoEntrar = document.querySelector("#modo-entrar");
    const modoCadastro = document.querySelector("#modo-cadastro");
    if (!formulario || !mensagem || !campoEmail || !campoSenha || !botaoEnviar || !modoEntrar || !modoCadastro) return;

    let modo = "entrar";
    function lerContas() {
        try {
            const dados = JSON.parse(localStorage.getItem("saborSL_contas") || "[]");
            return Array.isArray(dados) ? dados : [];
        } catch (e) {
            return [];
        }
    }
    function escolherModo(novoModo) {
        modo = novoModo;
        formulario.dataset.modo = modo;
        const cadastrando = modo === "cadastro";
        campoNome.hidden = !cadastrando;
        campoNome.required = cadastrando;
        campoNome.closest("label").hidden = !cadastrando;
        campoSenha.autocomplete = cadastrando ? "new-password" : "current-password";
        botaoEnviar.textContent = cadastrando ? "Criar conta" : "Entrar";
        modoEntrar.classList.toggle("ativo", !cadastrando);
        modoCadastro.classList.toggle("ativo", cadastrando);
        mensagem.hidden = true;
        mensagem.textContent = "";
    }
    modoEntrar.addEventListener("click", () => escolherModo("entrar"));
    modoCadastro.addEventListener("click", () => escolherModo("cadastro"));
    escolherModo(new URLSearchParams(window.location.search).get("modo") === "cadastro" ? "cadastro" : "entrar");

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();
        const nome = campoNome.value.trim();
        const email = campoEmail.value.trim().toLowerCase();
        const senha = campoSenha.value;
        if (!email) { mostrar("Digite seu e-mail.", true); return; }
        if (senha.length < 4) {
            mostrar("A senha precisa ter pelo menos 4 caracteres.", true);
            return;
        }

        let contas = lerContas();
        if (modo === "cadastro") {
            if (!nome) { mostrar("Digite seu nome para criar a conta.", true); return; }
            if (contas.some(conta => conta.email === email)) {
                mostrar("Já existe uma conta com esse e-mail. Clique em Entrar.", true);
                return;
            }
            contas.push({ nome: nome, email: email, senha: senha });
            try { localStorage.setItem("saborSL_contas", JSON.stringify(contas)); }
            catch (e) { mostrar("Não foi possível salvar a conta neste navegador.", true); return; }
            concluirAcesso({ nome: nome, email: email }, "Conta criada com sucesso!");
            return;
        }

        const conta = contas.find(item => item.email === email && item.senha === senha);
        if (conta) {
            concluirAcesso({ nome: conta.nome || email.split("@")[0], email: conta.email }, "Login realizado com sucesso!");
            return;
        }

        // Para facilitar a demonstração, o primeiro acesso pode criar uma conta local.
        // Isso não substitui um login real com servidor e proteção de senha.
        const emailExiste = contas.some(item => item.email === email);
        if (emailExiste) {
            mostrar("Senha incorreta. Confira a senha ou use Criar conta com outro e-mail.", true);
            return;
        }
        const nomeNovo = (campoNome.value || "").trim() || email.split("@")[0] || "Usuário";
        contas.push({ nome: nomeNovo, email: email, senha: senha });
        try { localStorage.setItem("saborSL_contas", JSON.stringify(contas)); }
        catch (e) { mostrar("Não foi possível salvar a conta neste navegador.", true); return; }
        concluirAcesso({ nome: nomeNovo, email: email }, "Primeiro acesso concluído!");
    });

    function mostrar(texto, erro) {
        mensagem.hidden = false;
        mensagem.textContent = texto;
        mensagem.classList.toggle("mensagem-erro", Boolean(erro));
    }
    function concluirAcesso(usuario, texto) {
        try { localStorage.setItem("saborSL_usuario", JSON.stringify(usuario)); }
        catch (e) { mostrar("Não foi possível manter o acesso neste navegador.", true); return; }
        mostrar(texto + " Olá, " + usuario.nome + ". Abrindo a página principal…", false);
        setTimeout(function () { window.location.href = "principal.html"; }, 700);
    }
});
