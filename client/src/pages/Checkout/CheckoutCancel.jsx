import { Link } from "react-router";

const CheckoutCancel = () => {
    return (
        <div className="container-page section-spacing">
            <div className="vault-card p-8 text-center">
                <h1 className="text-3xl font-black text-slate-900">
                    Payment Cancelled
                </h1>
                <p className="mt-3 text-slate-600">
                    Your card payment was not completed.
                </p>

                <Link
                    to="/plants"
                    className="mt-6 inline-flex rounded-2xl px-5 py-3 font-bold text-white"
                    style={{ background: "var(--primary)" }}
                >
                    Back to Plants
                </Link>
            </div>
        </div>
    );
};

export default CheckoutCancel;