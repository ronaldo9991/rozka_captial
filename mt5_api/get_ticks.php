<?php
/**
 * MT5 Live Tick Data Fetcher
 * Fetches real-time bid/ask prices from MT5 server
 */

require_once(__DIR__ . '/mt5_api.php');

// Symbols to fetch - common forex pairs and metals
$SYMBOLS = [
    'EURUSD',
    'GBPUSD', 
    'USDJPY',
    'USDCHF',
    'AUDUSD',
    'USDCAD',
    'NZDUSD',
    'XAUUSD',  // Gold
    'XAGUSD',  // Silver
    'BTCUSD',
    'ETHUSD',
];

// Get command line arguments or use defaults
$serverIp = $argv[1] ?? '192.109.17.202';
$serverPort = (int)($argv[2] ?? 443);
$login = $argv[3] ?? '10010';
$password = $argv[4] ?? 'Z!Lk3vDl';
$symbolsArg = $argv[5] ?? implode(',', $SYMBOLS);

$symbols = array_map('trim', explode(',', $symbolsArg));

// Connect to MT5
$api = new MTWebAPI('WebAPI', '/tmp/', false);
$result = $api->Connect($serverIp, (int)$serverPort, 30000, $login, $password);

if ($result != MTRetCode::MT_RET_OK) {
    echo json_encode([
        'success' => false,
        'error' => 'Connection failed',
        'errorCode' => $result,
        'errorMessage' => MTRetCode::GetError($result)
    ]);
    exit(1);
}

$ticks = [];
$errors = [];

foreach ($symbols as $symbol) {
    $tickData = null;
    $tickResult = $api->TickLast($symbol, $tickData);
    
    if ($tickResult == MTRetCode::MT_RET_OK && !empty($tickData)) {
        $tick = $tickData[0]; // Get first tick
        $ticks[] = [
            'symbol' => $tick->Symbol,
            'bid' => (float)$tick->Bid,
            'ask' => (float)$tick->Ask,
            'last' => (float)$tick->Last,
            'volume' => (float)$tick->VolumeReal,
            'digits' => (int)$tick->Digits,
            'spread' => round(((float)$tick->Ask - (float)$tick->Bid) * pow(10, (int)$tick->Digits), 1),
        ];
    } else {
        // Try TickStat as fallback
        $tickStat = null;
        $statResult = $api->TickStat($symbol, $tickStat);
        
        if ($statResult == MTRetCode::MT_RET_OK && !empty($tickStat)) {
            $stat = $tickStat[0];
            $ticks[] = [
                'symbol' => $stat->Symbol,
                'bid' => (float)$stat->Bid,
                'ask' => (float)$stat->Ask,
                'last' => (float)$stat->Last,
                'high' => (float)$stat->BidHigh,
                'low' => (float)$stat->BidLow,
                'volume' => (float)$stat->VolumeReal,
                'digits' => (int)$stat->Digits,
                'spread' => round(((float)$stat->Ask - (float)$stat->Bid) * pow(10, (int)$stat->Digits), 1),
                'bidDir' => (int)$stat->BidDir, // 0=none, 1=up, 2=down
            ];
        } else {
            $errors[] = [
                'symbol' => $symbol,
                'error' => MTRetCode::GetError($tickResult),
                'code' => $tickResult
            ];
        }
    }
}

$api->Disconnect();

echo json_encode([
    'success' => true,
    'timestamp' => time(),
    'server' => $serverIp,
    'ticks' => $ticks,
    'errors' => $errors
], JSON_PRETTY_PRINT);



