import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineShoppingBag,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

const Cart = () => {
  const { cartItems, cartShopId, cartTotal, cartCount, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [billData, setBillData] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const GST_RATE = 0.05;

  const parseOrderDate = (value) => {
    if (!value) return new Date();

    if (typeof value === 'string') {
      const hasTimezone = /([zZ]|[+\-]\d{2}:?\d{2})$/.test(value);
      if (!hasTimezone && value.includes('T')) {
        return new Date(`${value}Z`);
      }
    }

    return new Date(value);
  };

  const formatDateTime = (value) => {
    const date = parseOrderDate(value);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

  const getBillTotals = (order, fallbackGross = 0) => {
    const grossAmount = Number(order?.totalAmount ?? fallbackGross) || 0;
    const taxableAmount = grossAmount > 0 ? grossAmount / (1 + GST_RATE) : 0;
    const gstAmount = grossAmount - taxableAmount;

    return {
      taxableAmount,
      gstAmount,
      grossAmount,
    };
  };

  const escapeHtml = (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const printBill = (order, fallbackGross = 0) => {
    if (!order) return;

    const { taxableAmount, gstAmount, grossAmount } = getBillTotals(order, fallbackGross);
    const rows = (order.items || [])
      .map((item) => {
        const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
        return `
          <tr>
            <td>${escapeHtml(item.foodName)}</td>
            <td style="text-align:center;">${escapeHtml(item.quantity)}</td>
            <td style="text-align:right;">${formatCurrency(lineTotal)}</td>
          </tr>
        `;
      })
      .join('');

    const printWindow = window.open('', '_blank', 'width=480,height=760');
    if (!printWindow) {
      toast.error('Please allow popups to print the bill');
      return;
    }

    const html = `
      <html>
        <head>
          <title>Order Bill</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 16px; color: #222; }
            .center { text-align: center; }
            .muted { color: #666; font-size: 12px; }
            .top-gap { margin-top: 10px; }
            .divider { border-top: 1px dashed #999; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th, td { padding: 6px 0; }
            th { border-bottom: 1px solid #ddd; font-size: 12px; text-transform: uppercase; color: #555; }
            .totals { font-size: 13px; }
            .totals div { display: flex; justify-content: space-between; margin: 4px 0; }
            .grand { font-weight: 700; font-size: 15px; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="muted">SURPLIFY BILLING</div>
            <h2 style="margin:6px 0 2px;">${escapeHtml(order.shopName || 'Partner Shop')}</h2>
            <div class="muted">${escapeHtml(order.shopAddress || 'Shop address unavailable')}</div>
          </div>

          <div class="divider"></div>

          <div class="totals">
            <div><span>Bill No</span><span>#${escapeHtml(order._id?.slice(-6).toUpperCase())}</span></div>
            <div><span>Date & Time</span><span>${escapeHtml(formatDateTime(order.createdAt))}</span></div>
            <div><span>Payment</span><span>${escapeHtml(order.paymentStatus || 'pending')}</span></div>
            <div><span>Order</span><span>${escapeHtml(order.orderStatus || 'pending')}</span></div>
          </div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <th style="text-align:left;">Item</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="divider"></div>

          <div class="totals">
            <div><span>Taxable Amount</span><span>${formatCurrency(taxableAmount)}</span></div>
            <div><span>GST (5%)</span><span>${formatCurrency(gstAmount)}</span></div>
            <div class="grand"><span>Grand Total</span><span>${formatCurrency(grossAmount)}</span></div>
          </div>

          <div class="divider"></div>
          <div class="center muted top-gap">Thank you for dining with us</div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const closeBillPopup = () => {
    setBillData(null);
  };

  const handleOrder = async () => {
    if (cartItems.length === 0 || placingOrder) return;

    try {
      setPlacingOrder(true);
      const res = await api.post('/orders', {
        shopId: cartShopId,
        items: cartItems.map((item) => ({
          foodId: item._id,
          quantity: item.quantity,
        })),
      });

      const order = res.data?.order;
      if (order) {
        const computedTotal = (order.items || []).reduce(
          (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
          0
        );

        setBillData({
          ...order,
          createdAt: order.createdAt || new Date().toISOString(),
          totalAmount: Number(order.totalAmount ?? computedTotal),
        });
      }

      toast.success('Order placed successfully!');
      clearCart();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const isCartEmpty = cartItems.length === 0;
  const billSubtotal = (billData?.items || []).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const billSummary = getBillTotals(billData, billSubtotal);

  return (
    <>
      {isCartEmpty ? (
        <div className="page-container">
          <div className="text-center py-20">
            <HiOutlineShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Browse available food and add something delicious.</p>
            <button onClick={() => navigate('/browse')} className="btn-primary gap-2">
              Browse Food <HiOutlineArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="page-container">
          <div className="mb-8">
            <h1 className="section-title">Shopping Cart</h1>
            <p className="section-subtitle">{cartCount} item{cartCount > 1 ? 's' : ''} in your cart</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="card p-5 flex items-center gap-4">
                  {item.imageURL ? (
                    <img src={item.imageURL} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <HiOutlineShoppingBag className="w-8 h-8 text-primary-300" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.foodName}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      ₹{item.discountedPrice?.toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                    >
                      <HiOutlineMinus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, Math.min(item.quantity + 1, item.quantityAvailable))}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                    >
                      <HiOutlinePlus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ₹{(item.discountedPrice * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-600 mt-1"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <button onClick={clearCart} className="btn-ghost text-sm text-red-500 hover:text-red-600">
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartCount} items)</span>
                    <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Service Fee</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-primary-700">₹{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button onClick={handleOrder} disabled={placingOrder} className="btn-primary w-full mt-6 gap-2">
                  {placingOrder ? 'Placing Order...' : 'Place Order'}
                  {!placingOrder && <HiOutlineArrowRight className="w-5 h-5" />}
                </button>

                <p className="text-xs text-gray-400 text-center mt-4">
                  You'll pick up your order at the shop.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {billData && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 sm:p-6 md:p-10 flex items-center justify-center">
          <div className="w-full max-w-xl bg-[#fdfbf7] rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="px-6 py-6 text-center border-b border-dashed border-gray-300">
              <p className="text-[10px] tracking-[0.25em] text-gray-500 font-semibold">SURPLIFY BILLING</p>
              <h3 className="text-xl font-bold text-gray-900 mt-2">{billData.shopName || 'Partner Shop'}</h3>
              <p className="text-sm text-gray-600 mt-1">{billData.shopAddress || 'Shop address unavailable'}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                <HiOutlineCheckCircle className="w-4 h-4" />
                Order Confirmed
              </div>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto font-mono text-[13px]">
              <div className="grid grid-cols-2 gap-3 text-sm border-b border-dashed border-gray-300 pb-4">
                <div>
                  <p className="text-gray-500 uppercase text-[11px]">Bill No</p>
                  <p className="font-semibold text-gray-900">#{billData._id?.slice(-6).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-[11px]">Date & Time</p>
                  <p className="font-semibold text-gray-900">{formatDateTime(billData.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-[11px]">Payment</p>
                  <p className="font-semibold text-gray-900 capitalize">{billData.paymentStatus || 'pending'}</p>
                </div>
                <div>
                  <p className="text-gray-500 uppercase text-[11px]">Order</p>
                  <p className="font-semibold text-gray-900 capitalize">{billData.orderStatus || 'pending'}</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <div className="grid grid-cols-12 bg-gray-50 px-4 py-2 text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
                  <span className="col-span-6">Item</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-4 text-right">Amount</span>
                </div>
                {(billData.items || []).map((item, idx) => (
                  <div key={`${item.foodId || item.foodName}-${idx}`} className="grid grid-cols-12 px-4 py-3 border-t border-gray-100 items-center text-gray-800">
                    <p className="col-span-6 truncate pr-2">{item.foodName}</p>
                    <p className="col-span-2 text-center">{item.quantity}</p>
                    <p className="col-span-4 text-right font-semibold">{formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-t border-dashed border-gray-300 pt-4">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Taxable Amount</span>
                  <span>{formatCurrency(billSummary.taxableAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>GST (5%)</span>
                  <span>{formatCurrency(billSummary.gstAmount)}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                  <span className="font-semibold text-gray-900 text-base">Grand Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(billSummary.grossAmount)}
                  </span>
                </div>
              </div>

              <p className="text-center text-xs text-gray-500 pt-2">Thank you for dining with us</p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-white flex flex-col sm:flex-row gap-3">
              <button onClick={() => printBill(billData, billSubtotal)} className="btn-secondary w-full sm:w-1/2">
                Print Bill
              </button>
              <button onClick={closeBillPopup} className="btn-primary w-full sm:w-1/2">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
