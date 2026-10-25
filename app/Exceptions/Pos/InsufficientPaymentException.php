<?php

namespace App\Exceptions\Pos;

use DomainException;

class InsufficientPaymentException extends DomainException
{
    public function __construct(public readonly int $shortfall)
    {
        parent::__construct(
            'Pembayaran kurang Rp '.number_format($shortfall, 0, ',', '.').'.'
        );
    }
}
