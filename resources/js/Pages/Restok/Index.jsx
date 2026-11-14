import TriposLayout from '@/Layouts/TriposLayout';
import SearchableSelect from '@/Components/SearchableSelect';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Calendar,
    History,
    PackageCheck,
    PackagePlus,
    Plus,
    ReceiptText,
    Save,
    Trash2,
    Truck,
} from 'lucide-react';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const inputClass =
    'h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-500 transition-all';

const EMPTY_LINE = { item_id: '', qty: '', purchase_price: '' };

export default function Index({ suppliers, items, today, prefill = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        supplier_id: '',
        transacted_at: today,
        // Opened from the Stok suggestions: start with the suggested items already filled in
        lines: prefill.length > 0 ? prefill : [{ ...EMPTY_LINE }],
    });

    const lineTotal = (line) => (Number(line.qty) || 0) * (Number(line.purchase_price) || 0);
    const total = data.lines.reduce((sum, line) => sum + lineTotal(line), 0);
    const totalUnits = data.lines.reduce((sum, line) => sum + (Number(line.qty) || 0), 0);
    const kinds = new Set(data.lines.map((line) => line.item_id).filter(Boolean)).size;

    function setLine(index, field, value) {
        const lines = data.lines.map((line, i) => {
            if (i !== index) {
                return line;
            }

            const next = { ...line, [field]: value };

            // Picking an item automatically fills in its current cost price
            if (field === 'item_id') {
                const item = items.find((it) => String(it.id) === String(value));
                next.purchase_price = item ? String(item.cost_price) : '';
            }

            return next;
        });

        setData('lines', lines);
    }

    function addLine() {
        setData('lines', [...data.lines, { ...EMPTY_LINE }]);
    }

    function removeLine(index) {
        if (data.lines.length > 1) {
            setData('lines', data.lines.filter((_, i) => i !== index));
        }
    }

    function submit(e) {
        e.preventDefault();
        post(route('restok.store'), {
            onSuccess: () => reset(),
        });
    }

    return (
        <TriposLayout active="Restok">
            <Head title="Restok Barang" />

            <div className="flex flex-col gap-6">
                {/* Header with Segmented Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">Restok Barang</h1>
                        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                            Catat pembelian barang dari supplier. Stok dan harga modal akan diperbarui otomatis.
                        </p>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1.5 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800">
                        <span className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white">
                            <PackagePlus size={14} className="text-blue-600 dark:text-blue-400" />
                            Catat Restok
                        </span>
                        <Link
                            href={route('restok.riwayat')}
                            className="flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all"
                        >
                            <History size={14} />
                            Riwayat Restok
                        </Link>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-5 lg:flex-row items-start">
                    {/* Left Section: Supplier & Transaction Date + Line Items */}
                    <div className="flex min-w-0 flex-1 flex-col gap-5 w-full">
                        {/* Transaction Metadata Card */}
                        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="supplier" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        <Truck size={14} className="text-slate-400" />
                                        Supplier <span className="text-red-500">*</span>
                                    </label>
                                    <SearchableSelect
                                        id="supplier"
                                        value={data.supplier_id}
                                        onChange={(val) => setData('supplier_id', val)}
                                        options={suppliers}
                                        placeholder="Pilih supplier..."
                                        searchPlaceholder="Cari nama atau nomor telepon supplier..."
                                        filterFields={['name', 'phone_number']}
                                        hasError={!!errors.supplier_id}
                                        emptyMessage="Supplier tidak ditemukan"
                                        renderSelected={(supplier) => (
                                            <span className="font-semibold text-slate-900 dark:text-white truncate">
                                                {supplier.name}
                                            </span>
                                        )}
                                        renderOption={(supplier, { isSelected }) => (
                                            <div className="flex flex-col gap-0.5 py-0.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={`text-xs font-semibold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                                                        {supplier.name}
                                                    </span>
                                                    {supplier.phone_number && (
                                                        <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                                                            {supplier.phone_number}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    />
                                    {errors.supplier_id && (
                                        <p className="text-xs text-red-600 dark:text-red-400">{errors.supplier_id}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="tanggal" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        <Calendar size={14} className="text-slate-400" />
                                        Tanggal Pembelian <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="tanggal"
                                        type="date"
                                        value={data.transacted_at}
                                        onChange={(e) => setData('transacted_at', e.target.value)}
                                        className={inputClass}
                                    />
                                    {errors.transacted_at && (
                                        <p className="text-xs text-red-600 dark:text-red-400">{errors.transacted_at}</p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Error Alert for Lines */}
                        {errors.lines && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300">
                                {errors.lines}
                            </div>
                        )}

                        {/* Line Items Table Card */}
                        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90 overflow-hidden">
                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <PackageCheck size={16} className="text-blue-600 dark:text-blue-400" />
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Daftar Barang Masuk</h2>
                                </div>
                                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 tabular-nums">
                                    {data.lines.length} baris barang
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[680px] text-left text-sm">
                                    <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 w-[38%]">Barang</th>
                                            <th scope="col" className="px-4 py-3 w-[22%]">Jumlah Masuk</th>
                                            <th scope="col" className="px-4 py-3 w-[22%]">Harga Beli / Unit</th>
                                            <th scope="col" className="px-4 py-3 w-[14%]">Subtotal</th>
                                            <th scope="col" className="px-3 py-3 w-[4%] text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                        {data.lines.map((line, index) => {
                                            const selectedItem = items.find((it) => String(it.id) === String(line.item_id));

                                            return (
                                                <tr key={index} className="align-middle hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                                    {/* Item selection */}
                                                    <td className="px-4 py-3.5">
                                                        <SearchableSelect
                                                            value={line.item_id}
                                                            onChange={(val) => setLine(index, 'item_id', val)}
                                                            options={items}
                                                            placeholder="Pilih barang..."
                                                            searchPlaceholder="Cari nama barang..."
                                                            filterFields={['name']}
                                                            hasError={!!errors[`lines.${index}.item_id`]}
                                                            emptyMessage="Barang tidak ditemukan"
                                                            renderSelected={(item) => (
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <span className="truncate font-semibold text-slate-900 dark:text-white">
                                                                        {item.name}
                                                                    </span>
                                                                    <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                                        {item.unit}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            renderOption={(item, { isSelected }) => (
                                                                <div className="flex flex-col gap-0.5 py-0.5">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <span className={`text-xs font-semibold truncate ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                                                                            {item.name}
                                                                        </span>
                                                                        <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                                            {item.unit}
                                                                        </span>
                                                                    </div>
                                                                    {item.cost_price > 0 && (
                                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                                                            Modal: <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">Rp {item.cost_price.toLocaleString('id-ID')}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        />
                                                        {errors[`lines.${index}.item_id`] && (
                                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                                                {errors[`lines.${index}.item_id`]}
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* Qty with unit badge inside */}
                                                    <td className="px-4 py-3.5">
                                                        <div className="relative flex items-center">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                inputMode="numeric"
                                                                value={line.qty}
                                                                onChange={(e) => setLine(index, 'qty', e.target.value)}
                                                                placeholder="1"
                                                                className={`${inputClass} w-full pr-14 tabular-nums`}
                                                            />
                                                            <span className="absolute right-2.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400 pointer-events-none">
                                                                {selectedItem?.unit || 'unit'}
                                                            </span>
                                                        </div>
                                                        {errors[`lines.${index}.qty`] && (
                                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                                                {errors[`lines.${index}.qty`]}
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* Purchase Price with Rp prefix */}
                                                    <td className="px-4 py-3.5">
                                                        <div className="relative flex items-center">
                                                            <span className="absolute left-3 text-xs font-semibold text-slate-400 dark:text-slate-500 pointer-events-none">
                                                                Rp
                                                            </span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                inputMode="numeric"
                                                                value={line.purchase_price}
                                                                onChange={(e) => setLine(index, 'purchase_price', e.target.value)}
                                                                placeholder="0"
                                                                className={`${inputClass} w-full pl-9 tabular-nums`}
                                                            />
                                                        </div>
                                                        {errors[`lines.${index}.purchase_price`] && (
                                                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                                                                {errors[`lines.${index}.purchase_price`]}
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* Subtotal */}
                                                    <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white tabular-nums">
                                                        {rupiah(lineTotal(line))}
                                                    </td>

                                                    {/* Delete button */}
                                                    <td className="px-3 py-3.5 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLine(index)}
                                                            disabled={data.lines.length === 1}
                                                            title="Hapus baris barang"
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:opacity-30 disabled:pointer-events-none dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-all"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Add Line button */}
                            <div className="border-t border-slate-100 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                                <button
                                    type="button"
                                    onClick={addLine}
                                    className="inline-flex min-h-[38px] items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-blue-600 shadow-sm hover:border-blue-400 hover:bg-blue-50/50 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-800/80 transition-all w-full justify-center sm:w-auto"
                                >
                                    <Plus size={15} strokeWidth={2.5} />
                                    Tambah Baris Barang
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Right Section: Sticky Summary */}
                    <aside className="flex w-full shrink-0 flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 lg:w-[340px] lg:sticky lg:top-24 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/90">
                        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <ReceiptText size={16} />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Ringkasan Restok</h2>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">Kalkulasi total nilai masuk</p>
                            </div>
                        </div>

                        <div className="space-y-2.5 text-sm">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 dark:text-slate-400">Jenis Barang</span>
                                <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{kinds} jenis</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500 dark:text-slate-400">Total Unit Barang</span>
                                <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{totalUnits} unit</span>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-slate-800" />

                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Pembelian</span>
                            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                                {rupiah(total)}
                            </span>
                        </div>

                        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 leading-relaxed">
                            <PackageCheck size={16} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                            <div>
                                <p className="font-semibold text-emerald-900 dark:text-emerald-200">Stok & Modal Otomatis</p>
                                <p className="mt-0.5 text-[11px] text-emerald-800/90 dark:text-emerald-300/80">
                                    Stok barang bertambah dan harga modal terbaru langsung dicatat pada mutasi stok.
                                </p>
                            </div>
                        </div>

                        {errors.restok && (
                            <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-300">
                                {errors.restok}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={processing || total === 0}
                            className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            <Save size={16} />
                            Simpan Restok
                        </button>
                    </aside>
                </form>
            </div>
        </TriposLayout>
    );
}
