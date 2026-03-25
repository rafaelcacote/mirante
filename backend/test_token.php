<?php
$ch = curl_init('https://api.buysystem.com.br/scripts/gerar_token_admin.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_CAINFO, 'C:\wamp64\bin\php\php8.3.14\extras\ssl\cacert.pem');
$result = curl_exec($ch);
$err = curl_error($ch);
curl_close($ch);
if ($err) {
    echo "ERRO: " . $err . PHP_EOL;
} else {
    echo "Resposta bruta: " . $result . PHP_EOL;
    $json = json_decode($result, true);
    if ($json) {
        echo "É JSON: " . json_encode($json, JSON_PRETTY_PRINT) . PHP_EOL;
        // Tenta extrair o token de vários campos possíveis
        $token = $json['token'] ?? $json['data']['token'] ?? $json['access_token'] ?? $json['data'] ?? null;
        echo "Token extraído: " . $token . PHP_EOL;
    }
}
