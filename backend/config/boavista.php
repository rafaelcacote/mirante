<?php

return [

    /*
    |--------------------------------------------------------------------------
    | API pública de notícias — Prefeitura de Boa Vista
    |--------------------------------------------------------------------------
    |
    | URL consumida pelo proxy em /api/boavista/noticias (sem CORS no browser).
    |
    */

    'noticias_url' => env('BOAVISTA_NOTICIAS_URL', 'https://boavista.rr.gov.br/api/noticias'),

];
