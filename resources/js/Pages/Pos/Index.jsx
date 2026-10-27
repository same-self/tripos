import CashierLayout from '@/Layouts/CashierLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import ItemThumb from '@/Components/ItemThumb';

const QUICK_AMOUNTS = [20000, 50000, 100000];
const QUICK_PAGES = [10, 50, 100, 200];

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const fmt = (n) => Number(n).toLocaleString('id-ID', { maximumFractionDigits: 4 });

const ICON_PATHS = {
    'Alat Tulis': ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z'],
    Kertas: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
    Buku: ['M4 19.5A2.5 2.5 0 0 1 6.5 17H20', 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'],
    Aksesoris: [
        'm21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48',
    ],
};

function CategoryIcon({ category }) {
    const paths = ICON_PATHS[category] ?? ['M4 4h16v16H4z'];
    return (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#1D4ED8]">
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                {paths.map((d) => (
                    <path key={d} d={d} />
                ))}
            </svg>
        </span>
    );
}

function TabButton({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={`rounded-full px-4 py-2 text-[13px] ${
                active ? 'bg-[#1D4ED8] font-semibold text-white' : 'border border-[#E5E7EB] bg-white font-medium text-[#4B5563]'
            }`}
        >
            {children}
        </button>
    );
}

export default function Index({ items, services, paymentMethods }) {
    const { flash, errors } = usePage().props;

    const [tab, setTab] = useState('barang');
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [method, setMethod] = useState('cash');
    const [paid, setPaid] = useState(0);
    const [printReceipt, setPrintReceipt] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [serviceId, setServiceId] = useState(services[0]?.id ?? null);
    const [pages, setPages] = useState(10);

    const total = cart.reduce((sum, line) => sum + line.qty * line.price, 0);
    const change = Math.max(0, paid - total);
    const isCash = method === 'cash';

    const keyword = search.trim().toLowerCase();
    const shownItems = items.filter((item) => item.name.toLowerCase().includes(keyword));
    const shownServices = services.filter((service) => service.name.toLowerCase().includes(keyword));

    const selectedService = services.find((service) => service.id === serviceId) ?? null;
    const paper = selectedService?.materials?.[0] ?? null;

    function addToCart(key, name, price, unit, amount = 1) {
        setCart((prev) => {
            const found = prev.find((line) => line.key === key);
            if (found) {
                return prev.map((line) => (line.key === key ? { ...line, qty: line.qty + amount } : line));
            }
            return [...prev, { key, name, price, unit, qty: amount }];
        });
    }

    function changeQty(key, delta) {
        setCart((prev) =>
            prev
                .map((line) => (line.key === key ? { ...line, qty: line.qty + delta } : line))
                .filter((line) => line.qty > 0),
        );
    }

    function setQty(key, value) {
        const n = Math.floor(Number(value));
        setCart((prev) =>
            prev.map((line) => (line.key === key ? { ...line, qty: Number.isFinite(n) && n >= 1 ? n : 1 } : line)),
        );
    }

    function removeLine(key) {
        setCart((prev) => prev.filter((line) => line.key !== key));
    }

    function submitSale() {
        // Keys look like "barang-3" or "jasa-5": the number after the dash is the database id
        const itemLines = cart
            .filter((line) => line.key.startsWith('barang-'))
            .map((line) => ({ item_id: Number(line.key.split('-')[1]), qty: line.qty }));
        const serviceLines = cart
            .filter((line) => line.key.startsWith('jasa-'))
            .map((line) => ({ service_id: Number(line.key.split('-')[1]), qty: line.qty }));

        router.post(
            route('kasir.pos.store'),
            {
                items: itemLines,
                services: serviceLines,
                payment_method: method,
                amount_paid: isCash ? paid : 0,
            },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    setCart([]);
                    setPaid(0);
                    setPrintReceipt(false);
                },
            },
        );
    }

    return (
        <CashierLayout active="Transaksi (POS)">
            <Head title="Transaksi (POS)" />

            {flash?.success && (
                <p className="mb-4 rounded-xl bg-[#DCFCE7] px-4 py-3 text-sm font-medium text-[#15803D]">{flash.success}</p>
            )}

            <div className="flex flex-col gap-6 lg:flex-row">
                {/* Left: search, tabs, product cards, and the service panel */}
                <section className="flex min-w-0 flex-1 flex-col gap-4">
                    <label className="flex items-center gap-3 rounded-xl border-2 border-[#1D4ED8] bg-white px-4 py-3.5">
                        <span className="sr-only">Cari barang atau jasa</span>
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari barang atau jasa (nama / kode)"
                            className="min-w-0 flex-1 border-0 p-0 text-sm focus:ring-0"
                            autoFocus
                        />
                    </label>

                    <div className="flex gap-2">
                        <TabButton active={tab === 'barang'} onClick={() => setTab('barang')}>
                            Barang ATK
                        </TabButton>
                        <TabButton active={tab === 'jasa'} onClick={() => setTab('jasa')}>
                            Jasa Fotokopi
                        </TabButton>
                    </div>

                    {tab === 'barang' ? (
                        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                            {shownItems.map((item) => (
                                <li key={item.id} className="flex flex-col gap-1.5 rounded-xl border border-[#E5E7EB] bg-white p-3.5">
                                    <ItemThumb src={item.image_url} name={item.name} size="lg" />
                                    <div className="flex items-center gap-2">
                                        <CategoryIcon category={item.category} />
                                        <span className="text-xs font-medium text-[#4B5563]">{item.category}</span>
                                    </div>
                                    <p className="text-sm font-semibold">{item.name}</p>
                                    <p className="text-base font-bold text-[#1D4ED8]">{rupiah(item.sell_price)}</p>
                                    <p className={`text-xs ${item.low_stock ? 'text-[#B91C1C]' : 'text-[#4B5563]'}`}>
                                        Stok: {item.stock}
                                        {item.low_stock ? ' · menipis' : ''}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => addToCart(`barang-${item.id}`, item.name, item.sell_price, item.unit)}
                                        className="mt-1 rounded-lg bg-[#1D4ED8] py-1.5 text-xs font-semibold text-white"
                                    >
                                        Tambah
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <>
                            <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                                {shownServices.map((service) => {
                                    const selected = service.id === serviceId;
                                    return (
                                        <li key={service.id}>
                                            <button
                                                type="button"
                                                onClick={() => setServiceId(service.id)}
                                                aria-pressed={selected}
                                                className={`flex w-full flex-col gap-1.5 rounded-xl border p-3.5 text-left ${
                                                    selected ? 'border-[#1D4ED8] bg-[#DBEAFE]' : 'border-[#E5E7EB] bg-white'
                                                }`}
                                            >
                                                <span className="text-xs font-medium text-[#4B5563]">{service.category}</span>
                                                <span className="text-sm font-semibold">{service.name}</span>
                                                <span className="text-base font-bold text-[#1D4ED8]">
                                                    {rupiah(service.unit_price)}{' '}
                                                    <span className="text-xs font-normal text-[#4B5563]">per {service.unit}</span>
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>

                            {selectedService && (
                                <div className="flex flex-col gap-4 rounded-2xl border border-[#6B7280] bg-white p-5">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-base font-semibold">{selectedService.name}</h2>
                                        <span className="text-[13px] text-[#4B5563]">
                                            {rupiah(selectedService.unit_price)} per {selectedService.unit}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="pages" className="text-xs font-medium text-[#4B5563]">
                                            Jumlah {selectedService.unit}
                                        </label>
                                        <div className="flex items-center justify-between rounded-xl border border-[#1D4ED8] px-3.5 py-2.5">
                                            <input
                                                id="pages"
                                                type="number"
                                                min="1"
                                                inputMode="numeric"
                                                value={pages}
                                                onChange={(e) => setPages(Number(e.target.value) || 0)}
                                                className="w-full border-0 p-0 text-xl font-bold focus:ring-0"
                                            />
                                            <span className="text-[13px] text-[#4B5563]">{selectedService.unit}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {QUICK_PAGES.map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setPages(n)}
                                                className="rounded-lg bg-[#F3F4F6] px-3 py-1.5 text-xs font-medium"
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>

                                    {paper && (
                                        <div className="flex flex-col gap-1 rounded-xl bg-[#F3F4F6] p-3">
                                            <p className="text-[13px] font-semibold">
                                                {paper.name} terpakai: {fmt(pages * paper.per_unit)} {paper.unit}
                                            </p>
                                            <p className="text-xs text-[#4B5563]">
                                                {pages} {selectedService.unit} × {fmt(paper.per_unit)} {paper.unit} per{' '}
                                                {selectedService.unit}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        disabled={pages < 1}
                                        onClick={() =>
                                            addToCart(
                                                `jasa-${selectedService.id}`,
                                                selectedService.name,
                                                selectedService.unit_price,
                                                selectedService.unit,
                                                pages,
                                            )
                                        }
                                        className="rounded-xl bg-[#1D4ED8] py-3.5 font-semibold text-white disabled:opacity-50"
                                    >
                                        Tambah ke keranjang
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* Right: cart and payment */}
                <aside className="flex w-full shrink-0 flex-col gap-3.5 rounded-2xl border border-[#E5E7EB] bg-white p-5 lg:w-[460px]">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold">Keranjang</h2>
                        <span className="text-sm text-[#4B5563]">{cart.length} item</span>
                    </div>

                    {cart.length === 0 && (
                        <p className="py-4 text-center text-sm text-[#4B5563]">Belum ada barang di keranjang.</p>
                    )}

                    {cart.map((line) => (
                        <div key={line.key} className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{line.name}</p>
                                <p className="text-xs text-[#4B5563]">
                                    {line.qty} × {rupiah(line.price)}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        aria-label={`Kurangi ${line.name}`}
                                        onClick={() => changeQty(line.key, -1)}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F3F4F6] font-semibold"
                                    >
                                        −
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        inputMode="numeric"
                                        aria-label={`Jumlah ${line.name}`}
                                        value={line.qty}
                                        onChange={(e) => setQty(line.key, e.target.value)}
                                        className="h-7 w-14 rounded-lg border border-[#6B7280] text-center text-[13px] font-semibold"
                                    />
                                    <button
                                        type="button"
                                        aria-label={`Tambah ${line.name}`}
                                        onClick={() => changeQty(line.key, 1)}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1D4ED8] font-semibold text-white"
                                    >
                                        +
                                    </button>
                                </div>
                                <p className="w-24 text-right text-sm font-semibold">{rupiah(line.qty * line.price)}</p>
                                <button
                                    type="button"
                                    aria-label={`Hapus ${line.name}`}
                                    onClick={() => removeLine(line.key)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[#B91C1C] hover:bg-[#FEE2E2]"
                                >
                                    <Trash2 size={16} aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-3.5">
                        <span className="text-sm text-[#4B5563]">Total Tagihan</span>
                        <span className="text-2xl font-bold">{rupiah(total)}</span>
                    </div>

                    <div className="flex gap-1 rounded-xl bg-[#EEF2F7] p-1" role="group" aria-label="Metode pembayaran">
                        {paymentMethods.map((m) => (
                            <button
                                key={m.value}
                                type="button"
                                onClick={() => setMethod(m.value)}
                                aria-pressed={method === m.value}
                                className={`flex-1 rounded-lg py-2.5 text-sm ${
                                    method === m.value ? 'bg-white font-semibold shadow-sm' : 'font-medium text-[#4B5563]'
                                }`}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {isCash ? (
                        <>
                            <label htmlFor="paid" className="text-xs font-medium text-[#4B5563]">
                                Uang Diterima
                            </label>
                            <input
                                id="paid"
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={paid === 0 ? '' : paid}
                                onChange={(e) => setPaid(Number(e.target.value) || 0)}
                                placeholder="0"
                                className="h-12 rounded-xl border border-[#1D4ED8] px-4 text-lg font-bold"
                            />
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaid(total)}
                                    className="rounded-lg bg-[#F3F4F6] px-2.5 py-1.5 text-xs font-medium"
                                >
                                    Uang Pas
                                </button>
                                {QUICK_AMOUNTS.map((amount) => (
                                    <button
                                        key={amount}
                                        type="button"
                                        onClick={() => setPaid(amount)}
                                        className="rounded-lg bg-[#F3F4F6] px-2.5 py-1.5 text-xs font-medium"
                                    >
                                        {rupiah(amount)}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-[#DCFCE7] px-4 py-3">
                                <span className="text-sm font-medium">Kembalian</span>
                                <span className="text-lg font-bold text-[#16A34A]">{rupiah(change)}</span>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-[#4B5563]">Pelanggan membayar sebesar total tagihan melalui QRIS.</p>
                    )}

                    <label className="flex items-center gap-2 py-1 text-[13px]">
                        <input
                            type="checkbox"
                            checked={printReceipt}
                            onChange={(e) => setPrintReceipt(e.target.checked)}
                            className="h-4 w-4 rounded border-[#4B5563]"
                        />
                        Cetak struk thermal
                    </label>

                    {errors?.sale && (
                        <p className="rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">{errors.sale}</p>
                    )}

                    <button
                        type="button"
                        onClick={submitSale}
                        disabled={cart.length === 0 || processing}
                        className="rounded-xl bg-[#1D4ED8] py-4 font-semibold text-white disabled:opacity-50"
                    >
                        {processing ? 'Menyimpan...' : 'Selesaikan Transaksi'}
                    </button>
                </aside>
            </div>
        </CashierLayout>
    );
}