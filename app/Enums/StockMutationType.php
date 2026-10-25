<?php

namespace App\Enums;

enum StockMutationType: string
{
    case In = 'IN';
    case Out = 'OUT';
    case Adjustment = 'ADJUSTMENT';
}
