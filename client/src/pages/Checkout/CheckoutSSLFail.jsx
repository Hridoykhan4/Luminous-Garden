import { Link, useSearchParams } from "react-router";

const CheckoutSSLFail = () => {
    const [params] = useSearchParams();
    const message = params.get("message");

    return (
        <div className="container-page section-spacing">
            <div className="vault-card p-8 text-center">
                <h1 className="text-3xl font-black text-slate-900">
                    Payment Failed
                </h1>
                <p className="mt-3 text-slate-600">
                    {message || "Your SSLCommerz payment could not be completed."}
                </p>

                <Link
                    to="/plants"
                    className="mt-6 inline-flex rounded-2xl px-5 py-3 font-bold text-white"
                    style={{ background: "var(--primary)" }}
                >
                    Try Again
                </Link>
            </div>
        </div>
    );
};

export default CheckoutSSLFail;