<?php

return [
    'base_url' => env('BUYSYSTEM_BASE_URL', 'https://ek55yrj95p.apidog.io'),
    'unit_token' => env('BUYSYSTEM_UNIT_TOKEN', ''),
    'token_type' => env('BUYSYSTEM_TOKEN_TYPE', 'site'),
    'pdv_id' => env('BUYSYSTEM_PDV_ID', ''),
    'init_user_id' => (int) env('BUYSYSTEM_INIT_USER_ID', 1),
    'init_minutes' => (int) env('BUYSYSTEM_INIT_MINUTES', 120),
    'access_minutes' => (int) env('BUYSYSTEM_ACCESS_MINUTES', 60),
    'refresh_days' => (int) env('BUYSYSTEM_REFRESH_DAYS', 30),
    'token_description' => env('BUYSYSTEM_TOKEN_DESCRIPTION', 'WEB ADMIN'),

    'allowed_origins' => env('API_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173'),
    'default_origin' => env('API_DEFAULT_ORIGIN', 'http://localhost:5173'),
];
