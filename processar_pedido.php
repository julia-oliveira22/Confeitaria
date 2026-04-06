<?php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'confeitaria_gourmet';
$username = 'root'; // Padrão do Laragon
$password = ''; // Padrão do Laragon

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $dados = json_decode(file_get_contents("php://input"), true);

    if (!$dados) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'Sem dados.']);
        exit;
    }

    // 1. Vê se o cliente já existe pelo CPF
    $stmtBusca = $pdo->prepare("SELECT id FROM usuarios WHERE cpf = ?");
    $stmtBusca->execute([$dados['cpf']]);
    $usuarioExistente = $stmtBusca->fetch(PDO::FETCH_ASSOC);

    if ($usuarioExistente) {
        $usuario_id = $usuarioExistente['id'];
    } else {
        // Se for novo, cadastra
        $stmtUser = $pdo->prepare("INSERT INTO usuarios (nome, cpf, email, cep, endereco) VALUES (?, ?, ?, ?, ?)");
        $stmtUser->execute([
            $dados['nome'], $dados['cpf'], $dados['email'], $dados['cep'], $dados['endereco']
        ]);
        $usuario_id = $pdo->lastInsertId(); 
    }

    // 2. Insere o pedido
    $stmtPedido = $pdo->prepare("INSERT INTO pedidos (usuario_id, forma_pagamento, valor_total) VALUES (?, ?, ?)");
    $stmtPedido->execute([
        $usuario_id, $dados['pagamento'], $dados['valor_total']
    ]);

    echo json_encode(['sucesso' => true]);

} catch(PDOException $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => $e->getMessage()]);
}
?>