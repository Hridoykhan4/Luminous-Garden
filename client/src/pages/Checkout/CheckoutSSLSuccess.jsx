import { Link, useSearchParams } from "react-router";

const CheckoutSSLSuccess = () => {
    const [params] = useSearchParams();
    const orderId = params.get("orderId");

    return (
        <div className="container-page section-spacing">
            <div className="vault-card p-8 text-center">
                <h1 className="text-3xl font-black text-slate-900">
                    Payment Successful
                </h1>
                <p className="mt-3 text-slate-600">
                    Your SSLCommerz payment was completed successfully.
                </p>

                <div className="mt-6 flex items-center justify-center gap-3">
                    {orderId && (
                        <Link
                            to={`/orders/track/${orderId}`}
                            className="inline-flex rounded-2xl px-5 py-3 font-bold text-white"
                            style={{ background: "var(--primary)" }}
                        >
                            Track Order
                        </Link>
                    )}

                    <Link
                        to="/plants"
                        className="inline-flex rounded-2xl px-5 py-3 font-bold border"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSSLSuccess;