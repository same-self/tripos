<?php

namespace App\Support;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Support\Facades\Route;

/**
 * The sidebar menu, decided on the server so it follows the signed-in user's role
 * instead of being a fixed list in the browser.
 *
 * An item is shown only to the roles listed for it. If its route name does not exist yet
 * (the page is not built), `href` is null and the screen shows it greyed out. The moment
 * you add a route with that name, the link turns on by itself.
 */
final class Navigation
{
    /**
     * Edit this list to change the menu. Order = order on screen.
     *
     * @var list<array{label: string, route: string, roles: list<Role>}>
     */
    private const ITEMS = [
        ['label' => 'Dashboard',       'route' => 'dashboard',      'roles' => [Role::Admin]],
        ['label' => 'Transaksi (POS)', 'route' => 'kasir.pos',      'roles' => [Role::Admin, Role::Cashier]],
        ['label' => 'Barang',          'route' => 'barang.index',   'roles' => [Role::Admin]],
        ['label' => 'Layanan',         'route' => 'layanan.index',  'roles' => [Role::Admin]],
        ['label' => 'Supplier',        'route' => 'supplier.index', 'roles' => [Role::Admin]],
        ['label' => 'Restok',          'route' => 'restok.index',   'roles' => [Role::Admin]],
        ['label' => 'Stok',            'route' => 'stok.index',     'roles' => [Role::Admin]],
        ['label' => 'Laporan',         'route' => 'laporan.index',  'roles' => [Role::Admin]],
        ['label' => 'Pengguna',        'route' => 'pengguna.index', 'roles' => [Role::Admin]],
    ];

    /** @return list<array{label: string, href: ?string}> */
    public static function for(?User $user): array
    {
        if (! $user) {
            return [];
        }

        $items = [];

        foreach (self::ITEMS as $item) {
            if (! in_array($user->role, $item['roles'], true)) {
                continue;
            }

            $items[] = [
                'label' => $item['label'],
                'href' => Route::has($item['route']) ? route($item['route'], absolute: false) : null,
            ];
        }

        return $items;
    }
}
