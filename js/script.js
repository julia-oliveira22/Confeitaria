let produtoAtual = {};

function navegar(idDaTela) {
    const telas = ['home', 'pedidos', 'login', 'acompanhar'];
    telas.forEach(tela => document.getElementById(tela).classList.add('tela-oculta'));
    
    const telaAtiva = document.getElementById(idDaTela);
    telaAtiva.classList.remove('tela-oculta');
    telaAtiva.style.display = (idDaTela === 'home') ? 'flex' : 'block';
    window.scrollTo(0, 0);
}

function filtrar(categoria) {
    const produtos = document.querySelectorAll('.card-produto');
    produtos.forEach(produto => {
        if (categoria === 'todos' || produto.classList.contains(categoria)) {
            produto.style.display = 'flex';
        } else {
            produto.style.display = 'none';
        }
    });
}

function selecionarProduto(nome, preco, imgUrl) {
    produtoAtual = { nome: nome, preco: preco, img: imgUrl };
    document.getElementById('qtd-produto').value = 1; 
    navegar('login');
}

// ESTA É A FUNÇÃO QUE INSERE NO BANCO (comunica com o PHP)
async function confirmarPedido() {
    const nome = document.getElementById('nome-cliente').value;
    const cpf = document.getElementById('cpf-cliente').value;
    const email = document.getElementById('email-cliente').value;
    const cep = document.getElementById('cep-cliente').value;
    const endereco = document.getElementById('endereco-cliente').value;
    const qtd = parseInt(document.getElementById('qtd-produto').value) || 1;
    const pagamento = document.getElementById('forma-pagamento').value;
    
    if(!nome || !cpf || !endereco) {
        alert("Preencha Nome, CPF e Endereço!");
        return;
    }
    
    const valorTotal = produtoAtual.preco * qtd;

    const dadosPedido = {
        nome: nome,
        cpf: cpf,
        email: email,
        cep: cep,
        endereco: endereco,
        pagamento: pagamento,
        valor_total: valorTotal
    };

    try {
        // Envia para o PHP
        const resposta = await fetch('processar_pedido.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosPedido)
        });

        const resultado = await resposta.json();

        if (resultado.sucesso) {
            // Atualiza a tela de acompanhamento
            document.getElementById('img-pedido-atual').src = produtoAtual.img;
            document.getElementById('img-detalhe-atual').src = produtoAtual.img;
            document.getElementById('nome-detalhe-atual').innerHTML = `<strong>${produtoAtual.nome}</strong>`;
            document.getElementById('qtd-detalhe-atual').innerText = `Quantidade: ${qtd} unidade(s)`;
            document.getElementById('pagamento-detalhe-atual').innerText = `Forma de pagamento: ${pagamento}`;
            
            const valorFormatado = valorTotal.toFixed(2).replace('.', ',');
            document.getElementById('total-detalhe-atual').innerText = `Valor total pago: R$ ${valorFormatado}`;

            adicionarAoHistorico(produtoAtual, qtd, valorFormatado);

            // Mostra o sucesso
            const modal = document.getElementById('modal-sucesso');
            modal.classList.remove('modal-sucesso-oculto');
            setTimeout(() => {
                modal.classList.add('modal-sucesso-oculto');
                navegar('acompanhar');
            }, 2000);

        } else {
            alert("Erro do banco: " + resultado.mensagem);
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro de conexão. O PHP está na mesma pasta? Acessou via http://localhost?");
    }
}

function adicionarAoHistorico(produto, quantidade, totalFormatado) {
    const listaHistorico = document.getElementById('lista-historico');
    const novoItem = document.createElement('div');
    novoItem.classList.add('item-historico');
    novoItem.innerHTML = `
        <img src="${produto.img}" alt="${produto.nome}">
        <div class="detalhe-hist">
            <strong>${produto.nome}</strong>
            <p>Quantidade: ${quantidade}</p>
            <p>Valor total: R$ ${totalFormatado}</p>
        </div>
    `;
    listaHistorico.prepend(novoItem);
}