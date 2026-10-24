<?php

namespace App\Exceptions\Pos;

use DomainException;

class InsufficientStockException extends DomainException
{
    public function __construct(string $itemName, int $available, int $requested)
    {
        parent::__construct(
            "Stok {$itemName} tidak cukup (tersedia {$available}, diminta {$requested})."
        );
    }
}
