<?php

namespace App\Exceptions\Pos;

use DomainException;

class EmptyCartException extends DomainException
{
    public function __construct()
    {
        parent::__construct('Keranjang kosong. Tambahkan minimal 1 barang atau jasa.');
    }
}
