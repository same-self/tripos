import TriposLayout from '@/Layouts/TriposLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const rupiah = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const inputClass = 'h-10 rounded-[10px] border border-[#6B7280] bg-white px-3 text-sm';
const EMPTY_LINE = { item_id: '', qty: '', purchase_price: '' };

export default function Index({ suppliers, items, today }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        supplier_id: '',
        transacted_at: today,
        lines: [{ ...EMPTY_LINE }],
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

            // Picking an item fills in its current cost price, which the cashier can change
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
        setData('lines', data.lines.filter((_, i) => i !== index));
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

            <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-[22px] font-bold">Restok Barang</h1>
                        <p className="mt-1 text-[13px] text-[#4B5563]">
                            Catat pembelian dari supplier. Stok akan bertambah otomatis setelah disimpan.
                        </p>
                    </div>
                    <Link
                        href={route('restok.riwayat')}
                        className="rounded-[10px] border border-[#6B7280] px-3.5 py-2 text-[13px] font-medium"
                    >
                        Riwayat Restok
                    </Link>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-5 lg:flex-row">
                    {/* Purchase form */}
                    <section className="flex min-w-0 flex-1 flex-col gap-5 rounded-2xl border border-[#E5E7EB] bg-white p-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="supplier" className="text-xs font-medium text-[#4B5563]">Supplier</label>
                                <select
                                    id="supplier"
                                    value={data.supplier_id}
                                    onChange={(e) => setData('supplier_id', e.target.value)}
                                    className={inputClass}
                                >
                                    <option value="">Pilih supplier</option>
                                    {suppliers.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.supplier_id && <p className="text-xs text-[#B91C1C]">{errors.supplier_id}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="tanggal" className="text-xs font-medium text-[#4B5563]">Tanggal</label>
                                <input
                                    id="tanggal"
                                    type="date"
                                    value={data.transacted_at}
                                    onChange={(e) => setData('transacted_at', e.target.value)}
                                    className={inputClass}
                                />
                                {errors.transacted_at && (
                                    <p className="text-xs text-[#B91C1C]">{errors.transacted_at}</p>
                                )}
                            </div>
                        </div>

                        {errors.lines && <p className="text-xs text-[#B91C1C]">{errors.lines}</p>}

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-left text-sm">
                                <thead className="border-b border-[#E5E7EB] text-xs font-medium text-[#4B5563]">
                                    <tr>
                                        <th scope="col" className="px-2 py-2.5">Barang</th>
                                        <th scope="col" className="px-2 py-2.5">Jumlah</th>
                                        <th scope="col" className="px-2 py-2.5">Harga beli / unit</th>
                                        <th scope="col" className="px-2 py-2.5">Subtotal</th>
                                        <th scope="col" className="px-2 py-2.5"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.lines.map((line, index) => (
                                        <tr key={index} className="border-b border-[#E5E7EB] align-top last:border-b-0">
                                            <td className="px-2 py-3">
                                                <select
                                                    value={line.item_id}
                                                    onChange={(e) => setLine(index, 'item_id', e.target.value)}
                                                    className={`${inputClass} w-full`}
                                                >
                                                    <option value="">Pilih barang</option>
                                                    {items.map((item) => (
                                                        <option key={item.id} value={item.id}>
                                                            {item.name} ({item.unit})
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors[`lines.${index}.item_id`] && (
                                                    <p className="mt-1 text-xs text-[#B91C1C]">{errors[`lines.${index}.item_id`]}</p>
                                                )}
                                            </td>
                                            <td className="px-2 py-3">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    inputMode="numeric"
                                                    value={line.qty}
                                                    onChange={(e) => setLine(index, 'qty', e.target.value)}
                                                    className={`${inputClass} w-28`}
                                                />
                                                {errors[`lines.${index}.qty`] && (
                                                    <p className="mt-1 text-xs text-[#B91C1C]">{errors[`lines.${index}.qty`]}</p>
                                                )}
                                            </td>
                                            <td className="px-2 py-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    inputMode="numeric"
                                                    value={line.purchase_price}
                                                    onChange={(e) => setLine(index, 'purchase_price', e.target.value)}
                                                    className={`${inputClass} w-36`}
                                                />
                                                {errors[`lines.${index}.purchase_price`] && (
                                                    <p className="mt-1 text-xs text-[#B91C1C]">
                                                        {errors[`lines.${index}.purchase_price`]}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-2 py-3 font-semibold">{rupiah(lineTotal(line))}</td>
                                            <td className="px-2 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => removeLine(index)}
                                                    disabled={data.lines.length === 1}
                                                    className="text-[13px] font-medium text-[#B91C1C] disabled:opacity-40"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button type="button" onClick={addLine} className="self-start text-sm font-semibold text-[#1D4ED8]">
                            + Tambah barang
                        </button>
                    </section>

                    {/* Summary */}
                    <aside className="flex w-full shrink-0 flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 lg:w-[320px]">
                        <h2 className="text-base font-semibold">Ringkasan</h2>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#4B5563]">Jumlah jenis barang</span>
                            <span className="font-medium">{kinds}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-[#4B5563]">Total unit masuk</span>
                            <span className="font-medium">{totalUnits}</span>
                        </div>

                        <div className="h-px bg-[#E5E7EB]" />

                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-[#4B5563]">Total pembelian</span>
                            <span className="text-2xl font-bold">{rupiah(total)}</span>
                        </div>

                        <div className="rounded-xl bg-[#DCFCE7] p-3 text-[#15803D]">
                            <p className="text-[13px] font-semibold">Stok bertambah otomatis</p>
                            <p className="mt-1 text-xs">
                                Setelah disimpan, stok di menu Barang langsung diperbarui dan tercatat di riwayat mutasi.
                            </p>
                        </div>

                        {errors.restok && (
                            <p className="rounded-xl bg-[#FEE2E2] px-4 py-3 text-sm text-[#B91C1C]">{errors.restok}</p>
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#1D4ED8] py-3.5 font-semibold text-white disabled:opacity-60"
                        >
                            Simpan Restok
                        </button>
                    </aside>
                </form>
            </div>
        </TriposLayout>
    );
}